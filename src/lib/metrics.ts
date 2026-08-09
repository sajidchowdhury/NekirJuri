// ============================================================
// Madrasha ERP SaaS — In-Memory Metrics Collection
// Lightweight metrics for the /api/admin/metrics endpoint
// No external dependencies (Prometheus, etc.) — single instance
// ============================================================

import { perfLogger } from './logger'

// ============================================================
// Types
// ============================================================

interface RequestMetric {
  method: string
  path: string
  statusCode: number
  durationMs: number
  timestamp: number
  tenantId?: string
}

interface ErrorMetric {
  type: string
  message: string
  path?: string
  tenantId?: string
  timestamp: number
}

interface PerformanceSnapshot {
  timestamp: number
  memory: {
    heapUsedMb: number
    heapTotalMb: number
    rssMb: number
    usagePercent: number
  }
  eventLoopLagMs?: number
}

interface WebVitalMetric {
  name: string  // LCP, FID, CLS, TTFB, INP, FCp
  value: number
  rating: string  // 'good', 'needs-improvement', 'poor'
  navigationType: string
  url: string
  timestamp: number
}

// ============================================================
// Circular Buffer (bounded memory)
// ============================================================

class CircularBuffer<T> {
  private buffer: T[]
  private index = 0
  private filled = false

  constructor(private readonly capacity: number) {
    this.buffer = new Array(capacity)
  }

  push(item: T): void {
    this.buffer[this.index] = item
    this.index = (this.index + 1) % this.capacity
    if (this.index === 0) this.filled = true
  }

  items(): T[] {
    if (!this.filled) {
      return this.buffer.slice(0, this.index)
    }
    // Return items in insertion order (oldest first)
    return [...this.buffer.slice(this.index), ...this.buffer.slice(0, this.index)]
  }

  get length(): number {
    return this.filled ? this.capacity : this.index
  }
}

// ============================================================
// Metrics Store
// ============================================================

const MAX_REQUESTS = 1000
const MAX_ERRORS = 500
const MAX_PERF_SNAPSHOTS = 60
const MAX_WEB_VITALS = 200

const requestBuffer = new CircularBuffer<RequestMetric>(MAX_REQUESTS)
const errorBuffer = new CircularBuffer<ErrorMetric>(MAX_ERRORS)
const perfBuffer = new CircularBuffer<PerformanceSnapshot>(MAX_PERF_SNAPSHOTS)
const webVitalsBuffer = new CircularBuffer<WebVitalMetric>(MAX_WEB_VITALS)

// Counters
let totalRequests = 0
let totalErrors = 0
const requestsByStatus = new Map<number, number>()
const requestsByPath = new Map<string, { count: number; totalDurationMs: number }>()

// Start time
const startTime = Date.now()

// ============================================================
// Public API
// ============================================================

/**
 * Record an API request metric
 */
export function recordRequest(metric: RequestMetric): void {
  requestBuffer.push(metric)
  totalRequests++

  // Update status code counter
  const statusKey = Math.floor(metric.statusCode / 100) * 100 // Group: 200, 300, 400, 500
  requestsByStatus.set(statusKey, (requestsByStatus.get(statusKey) || 0) + 1)

  // Update path counter (normalize dynamic paths)
  const normalizedPath = normalizePath(metric.path)
  const existing = requestsByPath.get(normalizedPath)
  if (existing) {
    existing.count++
    existing.totalDurationMs += metric.durationMs
  } else {
    requestsByPath.set(normalizedPath, { count: 1, totalDurationMs: metric.durationMs })
  }

  // Log slow requests (>2s)
  if (metric.durationMs > 2000) {
    perfLogger.warn(
      { method: metric.method, path: normalizedPath, durationMs: metric.durationMs, statusCode: metric.statusCode },
      'Slow request detected (>2s)'
    )
  }
}

/**
 * Record an error
 */
export function recordError(metric: ErrorMetric): void {
  errorBuffer.push(metric)
  totalErrors++
}

/**
 * Take a performance snapshot (called periodically or on demand)
 */
export function takePerformanceSnapshot(): PerformanceSnapshot {
  const mem = process.memoryUsage()
  const snapshot: PerformanceSnapshot = {
    timestamp: Date.now(),
    memory: {
      heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      usagePercent: Math.round((mem.heapUsed / mem.heapTotal) * 100),
    },
  }

  perfBuffer.push(snapshot)
  return snapshot
}

/**
 * Get full metrics summary for the admin endpoint
 */
export function getMetricsSummary(): MetricsSummary {
  const recentRequests = requestBuffer.items()
  const recentErrors = errorBuffer.items()
  const perfSnapshots = perfBuffer.items()

  // Calculate request stats from recent requests
  const durations = recentRequests.map((r) => r.durationMs)
  const avgDurationMs = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0
  const p50DurationMs = durations.length > 0 ? percentile(durations, 50) : 0
  const p95DurationMs = durations.length > 0 ? percentile(durations, 95) : 0
  const p99DurationMs = durations.length > 0 ? percentile(durations, 99) : 0

  // Error rate (last 5 minutes)
  const fiveMinAgo = Date.now() - 5 * 60 * 1000
  const recentRequestCount = recentRequests.filter((r) => r.timestamp > fiveMinAgo).length
  const recentErrorCount = recentErrors.filter((e) => e.timestamp > fiveMinAgo).length
  const errorRate = recentRequestCount > 0 ? Math.round((recentErrorCount / recentRequestCount) * 10000) / 100 : 0

  // Top paths by count
  const topPaths = Array.from(requestsByPath.entries())
    .map(([path, data]) => ({
      path,
      count: data.count,
      avgDurationMs: Math.round(data.totalDurationMs / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  // Current performance
  const currentPerf = takePerformanceSnapshot()

  // Web Vitals summary
  const recentVitals = webVitalsBuffer.items().filter((v) => v.timestamp > fiveMinAgo)
  const vitalsSummary: Record<string, { avg: number; p75: number; count: number; goodCount: number }> = {}
  for (const v of recentVitals) {
    if (!vitalsSummary[v.name]) {
      vitalsSummary[v.name] = { avg: 0, p75: 0, count: 0, goodCount: 0 }
    }
    vitalsSummary[v.name].count++
    if (v.rating === 'good') vitalsSummary[v.name].goodCount++
  }
  // Calculate averages and p75 for each vital
  for (const [name, summary] of Object.entries(vitalsSummary)) {
    const values = recentVitals.filter((v) => v.name === name).map((v) => v.value)
    summary.avg = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0
    summary.p75 = values.length > 0 ? percentile(values, 75) : 0
  }

  return {
    uptime: {
      seconds: Math.round((Date.now() - startTime) / 1000),
      startedAt: new Date(startTime).toISOString(),
    },
    requests: {
      total: totalRequests,
      recentCount: recentRequestCount,
      avgDurationMs,
      p50DurationMs,
      p95DurationMs,
      p99DurationMs,
      byStatus: Object.fromEntries(requestsByStatus),
      topPaths,
    },
    errors: {
      total: totalErrors,
      recentCount: recentErrorCount,
      errorRatePercent: errorRate,
      recent: recentErrors
        .filter((e) => e.timestamp > fiveMinAgo)
        .slice(-20)
        .map((e) => ({
          type: e.type,
          message: e.message,
          path: e.path,
          timestamp: new Date(e.timestamp).toISOString(),
        })),
    },
    performance: {
      current: currentPerf,
      history: perfSnapshots.slice(-10),
    },
    webVitals: vitalsSummary,
  }
}

/**
 * Record a Web Vitals metric from the client
 */
export function recordWebVital(metric: WebVitalMetric): void {
  webVitalsBuffer.push(metric)
}

/**
 * Get recent Web Vitals
 */
export function getWebVitals(): WebVitalMetric[] {
  return webVitalsBuffer.items()
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics(): void {
  totalRequests = 0
  totalErrors = 0
  requestsByStatus.clear()
  requestsByPath.clear()
}

// ============================================================
// Helpers
// ============================================================

function normalizePath(path: string): string {
  // Replace UUIDs and numeric IDs with placeholders
  return path
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id')
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const sortedArr = [...sorted].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sortedArr.length) - 1
  return sortedArr[Math.max(0, index)]
}

// ============================================================
// Types Export
// ============================================================

export interface MetricsSummary {
  uptime: {
    seconds: number
    startedAt: string
  }
  requests: {
    total: number
    recentCount: number
    avgDurationMs: number
    p50DurationMs: number
    p95DurationMs: number
    p99DurationMs: number
    byStatus: Record<number, number>
    topPaths: Array<{ path: string; count: number; avgDurationMs: number }>
  }
  errors: {
    total: number
    recentCount: number
    errorRatePercent: number
    recent: Array<{ type: string; message: string; path?: string; timestamp: string }>
  }
  performance: {
    current: PerformanceSnapshot
    history: PerformanceSnapshot[]
  }
  webVitals: Record<string, { avg: number; p75: number; count: number; goodCount: number }>
}
