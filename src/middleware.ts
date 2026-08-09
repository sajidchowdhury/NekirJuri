// ============================================================
// Madrasha ERP SaaS — Next.js Middleware
// Tenant isolation + Route protection + Security hardening
// CR-6: Fix New Sale Modal — Add tenant/user context to API requests
// CR-7: SaaS Subscription Enforcement
// Session 4.2: Rate limiting, CSRF, Security headers, CORS, Body size
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { rateLimit, RateLimits, getClientIp } from '@/lib/rate-limit'
import { validateCsrf, setCsrfCookie, generateCsrfToken } from '@/lib/csrf'
import { applySecurityHeaders } from '@/lib/security-headers'

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

// Maximum request body size (1MB for API routes)
const MAX_BODY_SIZE = 1024 * 1024 // 1 MB

// Allowed origins for CORS (in production, set via env var)
const getAllowedOrigins = (): string[] => {
  const configured = process.env.CORS_ORIGINS
  if (configured) {
    return configured.split(',').map(o => o.trim())
  }
  // Default: same origin only
  return []
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProduction = process.env.NODE_ENV === 'production'
  const method = req.method.toUpperCase()

  // ---- Apply Security Headers to ALL responses ----
  const response = NextResponse.next()
  applySecurityHeaders(response, isProduction)

  // ---- Allow public routes ----
  if (publicRoutes.some(route => path.startsWith(route))) {
    // Set CSRF cookie on public page responses
    setCsrfCookie(response)
    return response
  }

  // ---- Allow static assets ----
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/favicon') ||
    path.startsWith('/logo')
  ) {
    return response
  }

  // ---- Health check: rate limit ----
  if (path === '/api/health') {
    const ip = getClientIp(req)
    const result = rateLimit(ip, RateLimits.health)
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests', retryAfter: result.retryAfter }),
        { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
      )
    }
    return response
  }

  // ---- API Routes: Security Checks ----
  if (path.startsWith('/api/')) {
    const ip = getClientIp(req)

    // -- Rate limiting per route type --
    let rateLimitConfig = RateLimits.api

    // Stricter limits for auth-related routes
    if (path.startsWith('/api/auth/register')) {
      rateLimitConfig = RateLimits.register
    } else if (path.startsWith('/api/auth/forgot-password')) {
      rateLimitConfig = RateLimits.forgotPassword
    } else if (path.includes('/auth/')) {
      rateLimitConfig = RateLimits.login
    }

    // Stricter limits for write operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      rateLimitConfig = RateLimits.write
    }

    const rateResult = rateLimit(ip, rateLimitConfig)
    if (!rateResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: rateResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Retry-After': String(rateResult.retryAfter),
            'X-RateLimit-Limit': String(rateResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateResult.resetAt / 1000)),
            'Content-Type': 'application/json',
          },
        },
      )
    }

    // -- CSRF Protection for mutation requests --
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (!validateCsrf(req)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'CSRF token validation failed. Please refresh the page and try again.',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // -- Request body size check --
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Request body too large. Maximum size is 1MB.',
        }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // -- CORS for API routes --
    const origin = req.headers.get('origin')
    if (origin && isProduction) {
      const allowedOrigins = getAllowedOrigins()
      if (allowedOrigins.length > 0 && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Tenant-Id')
        response.headers.set('Access-Control-Allow-Credentials', 'true')
        response.headers.set('Access-Control-Max-Age', '86400') // 24 hours
      }
    }

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      })
    }

    // -- Decode JWT and inject tenant/user ID headers --
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
      if (token) {
        const requestHeaders = new Headers(req.headers)
        if (token.tenantId) requestHeaders.set('x-tenant-id', String(token.tenantId))
        if (token.sub) requestHeaders.set('x-user-id', String(token.sub))

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch {
      // Token decode failed — proceed without headers; API will return 401
    }

    // Set CSRF cookie on API responses too
    setCsrfCookie(response)
    return response
  }

  // ---- Dashboard Route Protection ----
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
    return response
  }

  // Subscription enforcement is handled at the application level via:
  // 1. Session contains enforcementLevel (set during login in auth.ts)
  // 2. SubscriptionBanner component shows warnings based on enforcementLevel
  // 3. Feature gating hook (useSubscriptionGuard) blocks write operations
  // 4. API routes validate enforcement on each request

  // Set CSRF cookie on page responses
  setCsrfCookie(response)
  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
