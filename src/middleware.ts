// ============================================================
// Madrasha ERP SaaS — Next.js Middleware
// Tenant isolation + Route protection
// ============================================================

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(function middleware(req) {
  const token = req.nextauth.token
  const path = req.nextUrl.pathname

  // Allow public routes
  if (path.startsWith('/api/auth') || path === '/' || path === '/login') {
    return NextResponse.next()
  }

  // Super admin can access everything
  if (token.isSuperAdmin === 'true') {
    return NextResponse.next()
  }

  // For API routes, inject tenant context headers for backend use
  if (path.startsWith('/api/')) {
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-tenant-id', token.tenantId as string || '')
    requestHeaders.set('x-user-id', token.sub || '')
    requestHeaders.set('x-tenant-slug', token.tenantSlug as string || '')

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  }

  return NextResponse.next()
}, {
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname

      // Public routes don't need auth
      if (path.startsWith('/api/auth') || path === '/' || path === '/login' || path === '/register') {
        return true
      }

      // API routes require auth (except auth itself)
      if (path.startsWith('/api/')) {
        return !!token
      }

      // Page routes require auth
      return !!token
    },
  },
})

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
}
