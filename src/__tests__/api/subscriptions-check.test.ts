// ============================================================
// Integration Tests — /api/subscriptions/check
// ============================================================
// Tests the enforcement check endpoint with mocked Prisma.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: {
    tenant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
    },
  },
}))

import { db } from '@/lib/db'
import { GET } from '@/app/api/subscriptions/check/route'

// ──────────────────────────────────────────────
// Test Data
// ──────────────────────────────────────────────

const mockTenant = {
  id: 1,
  subscriptionStatus: 'active',
  isReadOnly: false,
}

const mockPlan = {
  id: 1,
  features: ['accounting', 'payroll'],
  maxStudents: 500,
  maxEmployees: 25,
  maxStorageMb: 2000,
  maxAlbums: 10,
  maxImagesPerAlbum: 50,
  maxImageSizeMb: 5,
}

const mockActiveSubscription = {
  id: 1,
  tenantId: 1,
  planId: 1,
  status: 'active',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2030-12-31'), // Far future so it's not expired
  currentPeriodEnd: new Date('2030-12-31'),
  gracePeriodEnd: null,
  restrictedEnd: null,
  trialEnd: null,
  plan: mockPlan,
}

// ──────────────────────────────────────────────
// GET /api/subscriptions/check
// ──────────────────────────────────────────────

describe('GET /api/subscriptions/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns error when tenantId query param is missing', async () => {
    const req = new Request('http://localhost:3000/api/subscriptions/check') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('tenantId')
  })

  it('returns error for non-numeric tenantId', async () => {
    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=abc') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toContain('valid number')
  })

  it('returns 404 when tenant not found', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=999') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it('returns blocked when no subscription exists', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTenant)
    ;(db.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=1') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.level).toBe('blocked')
    expect(body.data.status).toBe('none')
    expect(body.data.isExpired).toBe(true)
  })

  it('returns full access for active subscription', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTenant)
    ;(db.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockActiveSubscription)

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=1') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.level).toBe('full')
    expect(body.data.status).toBe('active')
  })

  it('returns plan limits from subscription plan', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockTenant)
    ;(db.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockActiveSubscription)

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=1') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.data.maxStudents).toBe(500)
    expect(body.data.maxEmployees).toBe(25)
    expect(body.data.maxStorageMb).toBe(2000)
  })

  it('returns readonly for grace_period subscription', async () => {
    const graceSubscription = {
      ...mockActiveSubscription,
      status: 'grace_period',
      endDate: new Date('2025-06-10'),
      gracePeriodEnd: new Date('2025-06-24'),
    }

    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockTenant,
      subscriptionStatus: 'grace_period',
      isReadOnly: true,
    })
    ;(db.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(graceSubscription)

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=1') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.level).toBe('readonly')
  })

  it('returns blocked for suspended subscription', async () => {
    const suspendedSubscription = {
      ...mockActiveSubscription,
      status: 'suspended',
    }

    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockTenant,
      subscriptionStatus: 'suspended',
      isReadOnly: true,
    })
    ;(db.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(suspendedSubscription)

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=1') as any
    const res = await GET(req)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.level).toBe('blocked')
  })

  it('updates tenant cache when stale', async () => {
    // Tenant cache says active, but subscription is grace_period
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockTenant,
      subscriptionStatus: 'active',  // Stale!
      isReadOnly: false,             // Stale!
    })
    ;(db.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockActiveSubscription,
      status: 'grace_period',
      endDate: new Date('2025-06-10'),
      gracePeriodEnd: new Date('2025-06-24'),
    })
    ;(db.tenant.update as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const req = new Request('http://localhost:3000/api/subscriptions/check?tenantId=1') as any
    await GET(req)

    // Should have updated the tenant cache
    expect(db.tenant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          subscriptionStatus: 'grace_period',
          isReadOnly: true,
        }),
      })
    )
  })
})
