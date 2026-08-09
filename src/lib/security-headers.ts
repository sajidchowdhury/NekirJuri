// ============================================================
// Madrasha ERP SaaS — Security Headers Configuration
// Production-grade security headers for Next.js
// ============================================================

import { NextResponse } from 'next/server'

/**
 * Security headers applied to all responses.
 * These are set in next.config.ts via the `headers()` function
 * for static responses and via middleware for dynamic responses.
 */
export const securityHeaders: Record<string, string> = {
  // Prevent clickjacking — only allow framing from same origin
  'X-Frame-Options': 'SAMEORIGIN',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Enable XSS protection in older browsers
  'X-XSS-Protection': '1; mode=block',

  // Control referrer information sent with requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy — restrict browser features
  'Permissions-Policy': [
    'camera=()',        // No camera access
    'microphone=()',    // No microphone access
    'geolocation=()',   // No geolocation
    'payment=(self)',   // Payment API from same origin only
    'usb=()',           // No USB access
  ].join(', '),

  // HSTS — Force HTTPS for 1 year (only in production)
  // Set dynamically in middleware based on NODE_ENV
}

/**
 * Content Security Policy directives.
 * Constructed programmatically for readability.
 */
export function getContentSecurityPolicy(isProduction: boolean): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      // Next.js requires inline scripts for hydration
      "'unsafe-inline'",
      // Next.js dev server requires eval (dev only)
      ...(!isProduction ? ["'unsafe-eval'"] : []),
    ],
    'style-src': [
      "'self'",
      // Tailwind CSS and shadcn/ui use inline styles
      "'unsafe-inline'",
    ],
    'img-src': [
      "'self'",
      'data:',           // Base64 images (avatars, etc.)
      'blob:',           // Blob URLs for file previews
      'https:',          // External images (HTTPS only)
    ],
    'font-src': [
      "'self'",
      'data:',           // Font data URIs
    ],
    'connect-src': [
      "'self'",
      // WebSocket for dev server
      ...(!isProduction ? ['ws:'] : []),
      // API calls to same origin
    ],
    'frame-ancestors': [
      "'self'",          // Only frame from same origin
    ],
    'form-action': [
      "'self'",          // Forms can only submit to same origin
    ],
    'base-uri': [
      "'self'",
    ],
    'object-src': [
      "'none'",          // No <object>, <embed>, <applet>
    ],
  }

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
}

/**
 * Apply security headers to a NextResponse object.
 * Used in middleware for dynamic responses.
 */
export function applySecurityHeaders(response: NextResponse, isProduction: boolean): NextResponse {
  // Apply all static security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  // Apply HSTS only in production
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  // Apply CSP
  response.headers.set(
    'Content-Security-Policy',
    getContentSecurityPolicy(isProduction)
  )

  return response
}
