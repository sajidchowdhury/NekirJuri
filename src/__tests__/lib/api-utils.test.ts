// ============================================================
// Unit Tests — src/lib/api-utils.ts
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  getPaginationParams,
  getTenantId,
  getUserId,
} from '@/lib/api-utils'

// ──────────────────────────────────────────────
// getPaginationParams
// ──────────────────────────────────────────────

describe('getPaginationParams', () => {
  it('returns defaults when no params provided', () => {
    const url = new URL('http://localhost:3000/api/test')
    const params = getPaginationParams(url)
    expect(params.page).toBe(1)
    expect(params.limit).toBe(20)
    expect(params.search).toBeUndefined()
    expect(params.sortBy).toBeUndefined()
    expect(params.sortOrder).toBe('asc')
  })

  it('parses page and limit', () => {
    const url = new URL('http://localhost:3000/api/test?page=3&limit=50')
    const params = getPaginationParams(url)
    expect(params.page).toBe(3)
    expect(params.limit).toBe(50)
  })

  it('clamps page to minimum 1', () => {
    const url = new URL('http://localhost:3000/api/test?page=-5')
    const params = getPaginationParams(url)
    expect(params.page).toBe(1)
  })

  it('clamps page to minimum 1 for zero', () => {
    const url = new URL('http://localhost:3000/api/test?page=0')
    const params = getPaginationParams(url)
    expect(params.page).toBe(1)
  })

  it('falls back to default 20 when limit=0 (falsy)', () => {
    const url = new URL('http://localhost:3000/api/test?limit=0')
    const params = getPaginationParams(url)
    // Number("0") = 0, and 0 || 20 = 20 (JavaScript truthy check)
    expect(params.limit).toBe(20)
  })

  it('clamps limit to maximum 100', () => {
    const url = new URL('http://localhost:3000/api/test?limit=500')
    const params = getPaginationParams(url)
    expect(params.limit).toBe(100)
  })

  it('handles non-numeric page gracefully', () => {
    const url = new URL('http://localhost:3000/api/test?page=abc')
    const params = getPaginationParams(url)
    expect(params.page).toBe(1) // NaN || 1 = 1
  })

  it('handles non-numeric limit gracefully', () => {
    const url = new URL('http://localhost:3000/api/test?limit=xyz')
    const params = getPaginationParams(url)
    expect(params.limit).toBe(20) // Falls back to default
  })

  it('parses search query', () => {
    const url = new URL('http://localhost:3000/api/test?search=john')
    const params = getPaginationParams(url)
    expect(params.search).toBe('john')
  })

  it('parses sortBy', () => {
    const url = new URL('http://localhost:3000/api/test?sortBy=name')
    const params = getPaginationParams(url)
    expect(params.sortBy).toBe('name')
  })

  it('parses sortOrder=desc', () => {
    const url = new URL('http://localhost:3000/api/test?sortOrder=desc')
    const params = getPaginationParams(url)
    expect(params.sortOrder).toBe('desc')
  })

  it('defaults sortOrder to asc for any non-desc value', () => {
    const url = new URL('http://localhost:3000/api/test?sortOrder=invalid')
    const params = getPaginationParams(url)
    expect(params.sortOrder).toBe('asc')
  })

  it('handles all params together', () => {
    const url = new URL('http://localhost:3000/api/test?page=2&limit=10&search=test&sortBy=date&sortOrder=desc')
    const params = getPaginationParams(url)
    expect(params).toEqual({
      page: 2,
      limit: 10,
      search: 'test',
      sortBy: 'date',
      sortOrder: 'desc',
    })
  })
})

// ──────────────────────────────────────────────
// getTenantId
// ──────────────────────────────────────────────

describe('getTenantId', () => {
  it('returns tenant ID from header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-tenant-id': '42' },
    })
    expect(getTenantId(req)).toBe(42)
  })

  it('returns null when header is missing', () => {
    const req = new Request('http://localhost')
    expect(getTenantId(req)).toBeNull()
  })

  it('returns NaN for non-numeric header value', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-tenant-id': 'abc' },
    })
    expect(getTenantId(req)).toBeNaN()
  })
})

// ──────────────────────────────────────────────
// getUserId
// ──────────────────────────────────────────────

describe('getUserId', () => {
  it('returns user ID from header', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-user-id': '7' },
    })
    expect(getUserId(req)).toBe(7)
  })

  it('returns null when header is missing', () => {
    const req = new Request('http://localhost')
    expect(getUserId(req)).toBeNull()
  })
})
