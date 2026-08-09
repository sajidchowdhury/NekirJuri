// ============================================================
// Madrasha ERP SaaS — CSRF Protection
// Double-submit cookie pattern for Next.js API routes
// ============================================================
// How it works:
// 1. Server sets a csrf-token cookie with SameSite=Strict
// 2. Client must include the same token in X-CSRF-Token header
// 3. Server compares cookie value with header value
// 4. If they match, the request is legitimate (not CSRF)
//
// For SameSite cookies, the browser won't send cookies on
// cross-origin requests, providing additional protection.
// The double-submit pattern adds defense-in-depth.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const CSRF_TOKEN_LENGTH = 32

/**
 * Generate a new CSRF token (cryptographically random)
 * Uses Web Crypto API (works in Edge Runtime)
 */
export function generateCsrfToken(): string {
  // crypto.randomUUID() is available in both Node.js and Edge Runtime
  // Combine two UUIDs to get a 32-char token (removing dashes)
  const uuid1 = crypto.randomUUID().replace(/-/g, '')
  const uuid2 = crypto.randomUUID().replace(/-/g, '')
  return (uuid1 + uuid2).substring(0, CSRF_TOKEN_LENGTH)
}

/**
 * Set CSRF cookie on a response if not already present.
 * Uses SameSite=Strict for maximum protection against CSRF.
 */
export function setCsrfCookie(response: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateCsrfToken()

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Must be readable by client JS
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return response
}

/**
 * Validate CSRF token for mutation requests (POST, PUT, PATCH, DELETE).
 * Implements the double-submit cookie pattern.
 *
 * Returns true if the request is valid, false if CSRF detected.
 */
export function validateCsrf(request: NextRequest): boolean {
  const method = request.method.toUpperCase()

  // Only validate mutation methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true
  }

  // Skip CSRF for auth routes (NextAuth handles its own CSRF)
  const path = request.nextUrl.pathname
  if (path.startsWith('/api/auth/')) {
    return true
  }

  // Skip CSRF for public webhook/callback routes (if any)
  if (path.startsWith('/api/webhooks/') || path.startsWith('/api/callbacks/')) {
    return true
  }

  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  // Both must be present and match
  if (!cookieToken || !headerToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return constantTimeEqual(cookieToken, headerToken)
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Returns true if strings are equal, false otherwise.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

/**
 * Get the CSRF cookie name (for client-side usage)
 */
export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME
}

/**
 * Get the CSRF header name (for client-side usage)
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME
}
