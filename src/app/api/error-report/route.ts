// ============================================================
// Madrasha ERP SaaS — Client Error Report Endpoint
// Receives error reports from client-side error boundaries
// Stores them in the in-memory metrics + logs via structured logger
// ============================================================

import { NextResponse } from 'next/server'
import { recordError } from '@/lib/metrics'
import { apiLogger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

interface ClientErrorReport {
  type: string
  message: string
  stack?: string
  componentStack?: string
  url?: string
  timestamp: number
}

export async function POST(request: Request) {
  try {
    const report: ClientErrorReport = await request.json()

    // Validate
    if (!report.type || !report.message) {
      return NextResponse.json(
        { success: false, error: 'Invalid error report' },
        { status: 400 }
      )
    }

    // Record in metrics
    recordError({
      type: `client:${report.type}`,
      message: report.message,
      path: report.url,
      timestamp: report.timestamp || Date.now(),
    })

    // Log via structured logger (Sentry server-side picks this up in prod)
    apiLogger.error(
      {
        type: report.type,
        message: report.message,
        url: report.url,
        componentStack: report.componentStack,
      },
      'Client error reported'
    )

    return NextResponse.json({ success: true }, { status: 202 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
