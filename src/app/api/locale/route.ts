// ============================================================
// Locale API Route — Set locale cookie
// CR-2: Multi-Language System
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VALID_LOCALES = ['en', 'bn', 'ar']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { locale } = body

    if (!locale || !VALID_LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale. Must be one of: en, bn, ar' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ locale, success: true })

    // Set cookie with 1 year expiry
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
