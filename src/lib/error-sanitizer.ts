// ============================================================
// Madrasha ERP SaaS — Error Sanitizer
// Prevents information disclosure in error responses
// ============================================================

/**
 * Sanitize an error for safe API response.
 * In production: returns a generic message.
 * In development: returns the full error for debugging.
 */
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'production') {
    // In production, never expose internal error details
    // Return a generic message; log the real error server-side
    if (error instanceof Error) {
      // Map known error types to user-friendly messages
      if (error.message.includes('Unique constraint')) {
        return 'A record with this value already exists'
      }
      if (error.message.includes('Foreign key constraint')) {
        return 'Referenced record not found'
      }
      if (error.message.includes('Record to update not found')) {
        return 'Record not found'
      }
      if (error.message.includes('Record to delete not found')) {
        return 'Record not found'
      }
    }

    // Generic fallback — never expose raw error in production
    return 'An error occurred while processing your request'
  }

  // In development, return full error for debugging
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

/**
 * Sanitized error response for API routes.
 * Replaces the raw `String(e)` pattern used in catch blocks.
 *
 * Usage:
 *   catch (e) {
 *     console.error('Route error:', e)  // Server-side logging
 *     return error(sanitizeErrorMessage(e), 500)
 *   }
 */
export function sanitizeErrorMessage(error: unknown): string {
  return sanitizeError(error)
}

/**
 * Log an error server-side (always full details).
 * In production, this would go to structured logging / Sentry.
 */
export function logError(context: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`[${context}]`, error.message, error.stack)
  } else {
    console.error(`[${context}]`, error)
  }
}
