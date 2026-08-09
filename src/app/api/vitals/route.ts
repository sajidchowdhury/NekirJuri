// ============================================================
// Madrasha ERP SaaS — Web Vitals Collection Endpoint
// Receives Web Vitals beacons from the client
// Stores them in-memory for the admin metrics dashboard
// ============================================================

import { NextResponse } from 'next/server'
import { recordWebVital } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

interface WebVitalPayload {
  name: string
  value: number
  rating: string
  navigationType: string
  url: string
  timestamp: number
}

export async function POST(request: Request) {
  try {
    const payload: WebVitalPayload = await request.json()

    // Validate required fields
    if (!payload.name || typeof payload.value !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid vitals payload' },
        { status: 400 }
      )
    }

    // Store in metrics
    recordWebVital(payload)

    return NextResponse.json({ success: true }, { status: 202 })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
