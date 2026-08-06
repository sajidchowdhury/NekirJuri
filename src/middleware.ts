// ============================================================
// Madrasha ERP SaaS — Next.js Middleware
// Tenant isolation + Route protection + Subscription enforcement
// CR-7: SaaS Subscription Enforcement
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth',
]

// Routes always accessible regardless of subscription status
const alwaysAccessibleRoutes = [
  '/dashboard',
  '/system/settings',
  '/system/billing',
  '/system/billing/',
]

// Routes accessible in read-only mode (restricted subscription)
const readOnlyRoutes = [
  '/academic',
  '/finance',
  '/inventory',
  '/accounting',
  '/website',
  '/system/users',
  '/system/notifications',
  '/system/activity-logs',
]

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow static assets
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/favicon') ||
    path.startsWith('/logo')
  ) {
    return NextResponse.next()
  }

  // For API routes, pass through (API routes handle their own auth)
  if (path.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionToken = req.cookies.get('next-auth.session-token')?.value
  if (!sessionToken) {
    // No session — redirect to login for dashboard routes
    if (path.startsWith('/dashboard') || path.startsWith('/academic') || path.startsWith('/finance') ||
        path.startsWith('/inventory') || path.startsWith('/accounting') || path.startsWith('/website') ||
        path.startsWith('/system')) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Subscription enforcement is handled at the application level via:
  // 1. Session contains enforcementLevel (set during login in auth.ts)
  // 2. SubscriptionBanner component shows warnings based on enforcementLevel
  // 3. Feature gating hook (useSubscriptionGuard) blocks write operations
  // 4. API routes validate enforcement on each request
  //
  // Middleware doesn't have easy access to decoded JWT claims,
  // so we defer the heavy enforcement to client-side + API-level checks.

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
