// ============================================================
// Test Helpers — Utilities for writing tests
// ============================================================

import { vi } from 'vitest'

// ──────────────────────────────────────────────
// Mock NextRequest
// ──────────────────────────────────────────────

/**
 * Create a mock NextRequest for testing API routes.
 * Simulates headers (x-tenant-id, x-user-id) and body.
 */
export function createMockRequest(options: {
  url?: string
  method?: string
  tenantId?: number
  userId?: number
  body?: unknown
  headers?: Record<string, string>
}) {
  const headers = new Map<string, string>()

  if (options.tenantId) headers.set('x-tenant-id', String(options.tenantId))
  if (options.userId) headers.set('x-user-id', String(options.userId))
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      headers.set(key, value)
    }
  }

  return {
    url: options.url ?? 'http://localhost:3000/api/test',
    method: options.method ?? 'GET',
    headers: {
      get: (name: string) => headers.get(name) ?? null,
    },
    json: vi.fn().mockResolvedValue(options.body ?? {}),
    nextUrl: new URL(options.url ?? 'http://localhost:3000/api/test'),
  }
}

// ──────────────────────────────────────────────
// Response Assertions
// ──────────────────────────────────────────────

/**
 * Assert that a mock NextResponse has the expected status and body shape.
 * Works with our mock NextResponse from setup.ts.
 */
export function expectResponse(response: { body: unknown; status: number }, expected: {
  status?: number
  success?: boolean
  bodyPart?: Record<string, unknown>
}) {
  if (expected.status !== undefined) {
    expect(response.status).toBe(expected.status)
  }
  if (expected.success !== undefined) {
    expect((response.body as Record<string, unknown>).success).toBe(expected.success)
  }
  if (expected.bodyPart) {
    const body = response.body as Record<string, unknown>
    for (const [key, value] of Object.entries(expected.bodyPart)) {
      expect(body[key]).toEqual(value)
    }
  }
}

// ──────────────────────────────────────────────
// Date Helpers
// ──────────────────────────────────────────────

/**
 * Create a Date that is N days from a reference date.
 */
export function daysFromNow(days: number, reference = new Date()): Date {
  const d = new Date(reference)
  d.setDate(d.getDate() + days)
  return d
}

/**
 * Create a Date that is N days before a reference date.
 */
export function daysAgo(days: number, reference = new Date()): Date {
  return daysFromNow(-days, reference)
}

/**
 * Check if a date is approximately equal to another (within 1 second).
 */
export function isDateApproxEqual(a: Date, b: Date, toleranceMs = 1000): boolean {
  return Math.abs(a.getTime() - b.getTime()) <= toleranceMs
}
