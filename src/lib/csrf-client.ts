// ============================================================
// Madrasha ERP SaaS — Client-Side CSRF Token Helper
// Reads CSRF token from cookie and includes in request headers
// ============================================================

const CSRF_COOKIE_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'

/**
 * Get the CSRF token from the cookie.
 * The cookie is set by the middleware on every response.
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === CSRF_COOKIE_NAME) {
      return decodeURIComponent(value)
    }
  }
  return null
}

/**
 * Get headers object with CSRF token for mutation requests.
 * Use with fetch/axios when making POST/PUT/PATCH/DELETE requests.
 *
 * Usage:
 *   const response = await fetch('/api/students', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       ...getCsrfHeaders(),
 *     },
 *     body: JSON.stringify(data),
 *   })
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfTokenFromCookie()
  if (token) {
    return { [CSRF_HEADER_NAME]: token }
  }
  return {}
}

/**
 * Enhanced fetch wrapper that automatically includes CSRF token
 * for mutation requests.
 */
export async function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase()

  // Add CSRF header for mutation requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfHeaders = getCsrfHeaders()
    options.headers = {
      ...(options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : options.headers || {}),
      ...csrfHeaders,
    }
  }

  return fetch(url, options)
}
