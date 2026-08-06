// ============================================================
// Madrasha ERP SaaS — Next.js Middleware
// Tenant isolation + Route protection
// Phase 1: Allow all page routes through for layout development
// Auth will be enforced in Phase 2
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Allow all page routes through for Phase 1 development
  // Auth protection will be added in Phase 2

  // For API routes, pass through
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
