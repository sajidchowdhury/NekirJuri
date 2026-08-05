// ============================================================
// Expense Categories API — GET (list), POST (create)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  created,
  error,
  paginated,
  getPaginationParams,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'

// --- GET: List expense categories with pagination & search ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.expenseCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          _count: { select: { expenses: true } },
        },
      }),
      db.expenseCategory.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[expense-categories][GET]', err)
    return error('Failed to fetch expense categories', 500)
  }
}

// --- POST: Create expense category ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()
    const { name, code, description, isActive } = body

    if (!name) {
      return error('name is required')
    }

    // Check unique code within tenant (if code provided)
    if (code) {
      const existing = await db.expenseCategory.findFirst({
        where: { tenantId: tid, code },
      })
      if (existing) return error('Expense category code already exists')
    }

    const record = await db.expenseCategory.create({
      data: {
        tenantId: tid,
        name,
        code: code || null,
        description: description || null,
        isActive: isActive ?? true,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'ExpenseCategory',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[expense-categories][POST]', err)
    return error('Failed to create expense category', 500)
  }
}
