import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  environment: string
  checks: {
    database: {
      status: 'connected' | 'disconnected'
      latencyMs?: number
      error?: string
      provider?: string
    }
    memory: {
      status: 'ok' | 'warning' | 'critical'
      heapUsedMb: number
      heapTotalMb: number
      rssMb: number
      usagePercent: number
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  const checks: HealthStatus['checks'] = {
    database: { status: 'disconnected' },
    memory: {
      status: 'ok',
      heapUsedMb: 0,
      heapTotalMb: 0,
      rssMb: 0,
      usagePercent: 0,
    },
  }

  // --- Database Check ---
  try {
    const dbStart = Date.now()
    await db.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart

    checks.database = {
      status: 'connected',
      latencyMs: dbLatency,
      provider: process.env.DATABASE_URL?.startsWith('postgresql') ? 'postgresql' : 'sqlite',
    }
  } catch (err) {
    checks.database = {
      status: 'disconnected',
      error: err instanceof Error ? err.message : 'Unknown database error',
    }
  }

  // --- Memory Check ---
  const mem = process.memoryUsage()
  const heapUsedMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100
  const heapTotalMb = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100
  const rssMb = Math.round((mem.rss / 1024 / 1024) * 100) / 100
  const usagePercent = Math.round((mem.heapUsed / mem.heapTotal) * 100)

  checks.memory = {
    status: usagePercent > 90 ? 'critical' : usagePercent > 75 ? 'warning' : 'ok',
    heapUsedMb,
    heapTotalMb,
    rssMb,
    usagePercent,
  }

  // --- Overall Status ---
  const dbOk = checks.database.status === 'connected'
  const memOk = checks.memory.status !== 'critical'
  const overallStatus: HealthStatus['status'] = dbOk && memOk ? 'healthy' : !dbOk ? 'unhealthy' : 'degraded'

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || '0.2.1',
    environment: process.env.NODE_ENV || 'development',
    checks,
  }

  const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json(health, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  })
}
