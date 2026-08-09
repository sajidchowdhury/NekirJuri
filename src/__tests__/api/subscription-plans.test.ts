// ============================================================
// Integration Tests — /api/subscription-plans
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: {
    subscriptionPlan: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}))

import { db } from '@/lib/db'
import { GET, POST } from '@/app/api/subscription-plans/route'

// ──────────────────────────────────────────────
// GET /api/subscription-plans
// ──────────────────────────────────────────────

describe('GET /api/subscription-plans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when tenant ID is missing', async () => {
    const req = new Request('http://localhost:3000/api/subscription-plans') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it('returns paginated plans', async () => {
    const mockPlans = [
      { id: 1, name: 'Basic', slug: 'basic', priceMonthly: 999 },
      { id: 2, name: 'Standard', slug: 'standard', priceMonthly: 1999 },
    ]
    ;(db.subscriptionPlan.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlans)
    ;(db.subscriptionPlan.count as ReturnType<typeof vi.fn>).mockResolvedValue(2)

    const req = new Request('http://localhost:3000/api/subscription-plans', {
      headers: { 'x-tenant-id': '1' },
    }) as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.data).toHaveLength(2)
    expect(body.pagination.total).toBe(2)
  })
})

// ──────────────────────────────────────────────
// POST /api/subscription-plans
// ──────────────────────────────────────────────

describe('POST /api/subscription-plans', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when tenant ID is missing', async () => {
    const req = new Request('http://localhost:3000/api/subscription-plans', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', slug: 'test', priceMonthly: 999, maxStudents: 100, maxEmployees: 10, maxStorageMb: 500 }),
    }) as any
    const res = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it('returns 400 when name is missing', async () => {
    const req = new Request('http://localhost:3000/api/subscription-plans', {
      method: 'POST',
      headers: { 'x-tenant-id': '1' },
      body: JSON.stringify({ slug: 'test', priceMonthly: 999, maxStudents: 100, maxEmployees: 10, maxStorageMb: 500 }),
    }) as any
    const res = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('name')
  })

  it('returns 400 when required pricing is missing', async () => {
    const req = new Request('http://localhost:3000/api/subscription-plans', {
      method: 'POST',
      headers: { 'x-tenant-id': '1' },
      body: JSON.stringify({ name: 'Test', slug: 'test', maxStudents: 100, maxEmployees: 10, maxStorageMb: 500 }),
    }) as any
    const res = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('priceMonthly')
  })

  it('returns 400 when slug already exists', async () => {
    ;(db.subscriptionPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1, slug: 'basic',
    })

    const req = new Request('http://localhost:3000/api/subscription-plans', {
      method: 'POST',
      headers: { 'x-tenant-id': '1' },
      body: JSON.stringify({
        name: 'Basic', slug: 'basic', priceMonthly: 999,
        maxStudents: 100, maxEmployees: 10, maxStorageMb: 500,
      }),
    }) as any
    const res = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('already exists')
  })

  it('creates plan with gallery limit defaults (CR-11)', async () => {
    ;(db.subscriptionPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.subscriptionPlan.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 1, name: 'Test Plan', slug: 'test-plan',
    })

    const req = new Request('http://localhost:3000/api/subscription-plans', {
      method: 'POST',
      headers: { 'x-tenant-id': '1', 'x-user-id': '1' },
      body: JSON.stringify({
        name: 'Test Plan', slug: 'test-plan', priceMonthly: 999,
        maxStudents: 100, maxEmployees: 10, maxStorageMb: 500,
      }),
    }) as any
    const res = await POST(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(res.status).toBe(201)

    // Verify gallery limits were set with defaults
    const createCall = (db.subscriptionPlan.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(createCall.data.maxAlbums).toBe(5)
    expect(createCall.data.maxImagesPerAlbum).toBe(20)
    expect(createCall.data.maxImageSizeMb).toBe(2)
  })

  it('creates plan with custom gallery limits', async () => {
    ;(db.subscriptionPlan.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.subscriptionPlan.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 2, name: 'Premium', slug: 'premium',
    })

    const req = new Request('http://localhost:3000/api/subscription-plans', {
      method: 'POST',
      headers: { 'x-tenant-id': '1', 'x-user-id': '1' },
      body: JSON.stringify({
        name: 'Premium', slug: 'premium', priceMonthly: 4999,
        maxStudents: 2000, maxEmployees: 50, maxStorageMb: 10000,
        maxAlbums: 20, maxImagesPerAlbum: 100, maxImageSizeMb: 10,
      }),
    }) as any
    const res = await POST(req)
    expect(res.status).toBe(201)

    const createCall = (db.subscriptionPlan.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(createCall.data.maxAlbums).toBe(20)
    expect(createCall.data.maxImagesPerAlbum).toBe(100)
    expect(createCall.data.maxImageSizeMb).toBe(10)
  })
})
