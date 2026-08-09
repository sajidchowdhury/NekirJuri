// ============================================================
// Vitest Global Setup
// ============================================================
// Note: We do NOT mock next/server here — the real NextResponse
// works in the vitest/node environment and mocking it breaks
// the .json() method on responses from API routes.
// ============================================================

import { vi } from 'vitest'

// Mock the Prisma client globally for all tests
vi.mock('@/lib/db', () => {
  const mockDb = {
    tenant: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscriptionPlan: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    subscriptionPayment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    chartOfAccount: {
      create: vi.fn(),
      createMany: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    student: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teacher: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    feeCategory: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    feeInvoice: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    feeCollection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    donation: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    expense: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((fn: (db: typeof mockDb) => Promise<unknown>) => fn(mockDb)),
  }

  return { db: mockDb }
})
