// ============================================================
// Madrasha ERP SaaS — Admin Metrics Endpoint
// GET /api/admin/metrics — Server-side metrics for monitoring
// ============================================================

import { NextResponse } from 'next/server'
import { getMetricsSummary, takePerformanceSnapshot } from '@/lib/metrics'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  try {
    // Get in-memory metrics summary
    const metrics = getMetricsSummary()

    // Check database connectivity
    let dbStats: Record<string, unknown> = {}
    try {
      const dbStart = Date.now()
      await db.$queryRaw`SELECT 1`
      const dbLatency = Date.now() - dbStart

      dbStats = {
        status: 'connected',
        latencyMs: dbLatency,
        provider: process.env.DATABASE_URL?.startsWith('postgresql') ? 'postgresql' : 'sqlite',
      }
    } catch (err) {
      dbStats = {
        status: 'disconnected',
        error: err instanceof Error ? err.message : 'Unknown DB error',
      }
    }

    // Current performance snapshot
    const currentPerf = takePerformanceSnapshot()

    const response = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.2.1',
      metrics,
      database: dbStats,
      currentPerformance: currentPerf,
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve metrics',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
