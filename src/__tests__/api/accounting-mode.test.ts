// ============================================================
// Integration Tests — /api/accounting-mode
// ============================================================
// Tests the GET and POST handlers with mocked Prisma.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: {
    tenant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    chartOfAccount: {
      count: vi.fn().mockResolvedValue(0),
      createMany: vi.fn().mockResolvedValue({ count: 17 }),
    },
  },
}))

import { db } from '@/lib/db'
import { GET, POST } from '@/app/api/accounting-mode/route'

// Helper: create mock NextRequest
function mockRequest(options: {
  tenantId?: number
  body?: unknown
}) {
  const headers = new Headers()
  if (options.tenantId) headers.set('x-tenant-id', String(options.tenantId))

  return new Request('http://localhost:3000/api/accounting-mode', {
    method: options.body ? 'POST' : 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }) as any // Cast to NextRequest-like
}

// ──────────────────────────────────────────────
// GET /api/accounting-mode
// ──────────────────────────────────────────────

describe('GET /api/accounting-mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when tenant ID is missing', async () => {
    const req = mockRequest({})
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('returns 404 when tenant not found', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const req = mockRequest({ tenantId: 999 })
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(404)
    expect(body.error).toBeDefined()
  })

  it('returns double-entry mode for tenant', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      accountingMode: 'double-entry',
    })

    const req = mockRequest({ tenantId: 1 })
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.mode).toBe('double-entry')
  })

  it('returns simplified mode for tenant', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      accountingMode: 'simplified',
    })

    const req = mockRequest({ tenantId: 1 })
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.mode).toBe('simplified')
  })

  it('falls back to double-entry for corrupt mode value', async () => {
    ;(db.tenant.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      accountingMode: 'invalid_mode',
    })

    const req = mockRequest({ tenantId: 1 })
    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.mode).toBe('double-entry')
  })
})

// ──────────────────────────────────────────────
// POST /api/accounting-mode
// ──────────────────────────────────────────────

describe('POST /api/accounting-mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when tenant ID is missing', async () => {
    const req = mockRequest({ body: { mode: 'simplified' } })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(401)
    expect(body.error).toBeDefined()
  })

  it('returns 400 for invalid mode', async () => {
    const req = mockRequest({ tenantId: 1, body: { mode: 'triple-entry' } })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toContain('Invalid mode')
  })

  it('returns 400 when mode is missing', async () => {
    const req = mockRequest({ tenantId: 1, body: {} })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(400)
  })

  it('updates to double-entry mode', async () => {
    ;(db.tenant.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      accountingMode: 'double-entry',
    })

    const req = mockRequest({ tenantId: 1, body: { mode: 'double-entry' } })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.mode).toBe('double-entry')
    expect(body.success).toBe(true)

    expect(db.tenant.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { accountingMode: 'double-entry' },
    })
  })

  it('updates to simplified mode and generates accounts when none exist', async () => {
    ;(db.tenant.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      accountingMode: 'simplified',
    })
    ;(db.chartOfAccount.count as ReturnType<typeof vi.fn>).mockResolvedValue(0)
    ;(db.chartOfAccount.createMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 17 })

    const req = mockRequest({ tenantId: 1, body: { mode: 'simplified' } })
    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.mode).toBe('simplified')

    // Should have called createMany to generate simplified accounts
    expect(db.chartOfAccount.createMany).toHaveBeenCalled()
  })

  it('does not generate accounts when switching to simplified if accounts already exist', async () => {
    ;(db.tenant.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      accountingMode: 'simplified',
    })
    ;(db.chartOfAccount.count as ReturnType<typeof vi.fn>).mockResolvedValue(5)

    const req = mockRequest({ tenantId: 1, body: { mode: 'simplified' } })
    const res = await POST(req)
    expect(res.status).toBe(200)

    // Should NOT have called createMany since accounts exist
    expect(db.chartOfAccount.createMany).not.toHaveBeenCalled()
  })
})
