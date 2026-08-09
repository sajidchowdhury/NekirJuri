// ============================================================
// Zod Validation — Central Export
// ============================================================

export * from './academic'
export * from './finance'
export * from './inventory'
export * from './accounting'
export * from './system'

// ── Validation Error Helper ───────────────────────────────

import { ZodError } from 'zod'

/** Format ZodError into a human-readable string for API error responses */
export function formatZodError(err: ZodError): string {
  const issues = err.issues.map((issue) => {
    const field = issue.path.join('.')
    return `${field}: ${issue.message}`
  })
  return `Validation error: ${issues.join('; ')}`
}
