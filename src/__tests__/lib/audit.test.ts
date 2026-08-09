// ============================================================
// Unit Tests — src/lib/audit.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the db module before importing audit
vi.mock('@/lib/db', () => ({
  db: {
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}))

import { db } from '@/lib/db'
import { createAuditLog } from '@/lib/audit'

// ──────────────────────────────────────────────
// createAuditLog
// ──────────────────────────────────────────────

describe('createAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls db.auditLog.create with correct data', () => {
    createAuditLog({
      tenantId: 1,
      userId: 5,
      action: 'CREATE',
      entityType: 'Student',
      entityId: 42,
    })

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: {
        tenantId: 1,
        userId: 5,
        action: 'CREATE',
        entityType: 'Student',
        entityId: 42,
        oldValues: null,
        newValues: null,
        ipAddress: null,
      },
    })
  })

  it('handles UPDATE action with old and new values', () => {
    createAuditLog({
      tenantId: 1,
      userId: 3,
      action: 'UPDATE',
      entityType: 'FeeCategory',
      entityId: 10,
      oldValues: { name: 'Old Name' },
      newValues: { name: 'New Name' },
    })

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: {
        tenantId: 1,
        userId: 3,
        action: 'UPDATE',
        entityType: 'FeeCategory',
        entityId: 10,
        oldValues: JSON.stringify({ name: 'Old Name' }),
        newValues: JSON.stringify({ name: 'New Name' }),
        ipAddress: null,
      },
    })
  })

  it('handles DELETE action', () => {
    createAuditLog({
      tenantId: 1,
      userId: 2,
      action: 'DELETE',
      entityType: 'Expense',
      entityId: 99,
    })

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'DELETE',
        entityType: 'Expense',
        entityId: 99,
      }),
    })
  })

  it('handles null userId', () => {
    createAuditLog({
      tenantId: 1,
      action: 'CREATE',
      entityType: 'Tenant',
    })

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: null,
      }),
    })
  })

  it('stringifies oldValues and newValues', () => {
    const oldVal = { amount: 100, status: 'pending' }
    const newVal = { amount: 100, status: 'paid' }

    createAuditLog({
      tenantId: 1,
      action: 'UPDATE',
      entityType: 'Payment',
      oldValues: oldVal,
      newValues: newVal,
    })

    const callArgs = (db.auditLog.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(callArgs.data.oldValues).toBe(JSON.stringify(oldVal))
    expect(callArgs.data.newValues).toBe(JSON.stringify(newVal))
  })

  it('passes null for oldValues/newValues when not provided', () => {
    createAuditLog({
      tenantId: 1,
      action: 'CREATE',
      entityType: 'Student',
    })

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        oldValues: null,
        newValues: null,
      }),
    })
  })

  it('includes ipAddress when provided', () => {
    createAuditLog({
      tenantId: 1,
      action: 'CREATE',
      entityType: 'User',
      ipAddress: '192.168.1.1',
    })

    expect(db.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ipAddress: '192.168.1.1',
      }),
    })
  })
})
