// ============================================================
// Fee Categories API — GET (list), POST (create)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  paginated,
  getPaginationParams,
  getTenantId,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'
import { feeCategoryCreateSchema, formatZodError } from '@/lib/validations'

// --- GET: List fee categories with pagination & search ---
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
      ]
    }

    const [data, total] = await Promise.all([
      db.feeCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
      }),
      db.feeCategory.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[fee-categories][GET]', err)
    return error('Failed to fetch fee categories', 500)
  }
}

// --- POST: Create fee category ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = feeCategoryCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const { name, code, description, amount, isRecurring, frequency } = parsed.data

    // Check unique code within tenant
    const existing = await db.feeCategory.findFirst({
      where: { tenantId: tid, code },
    })
    if (existing) return error('Fee category code already exists')

    const record = await db.feeCategory.create({
      data: {
        tenantId: tid,
        name,
        code,
        description: description || null,
        amount: Number(amount),
        nameBn: parsed.data.nameBn || null,
        isRecurring: isRecurring ?? false,
        frequency: frequency || null,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'FeeCategory',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[fee-categories][POST]', err)
    return error('Failed to create fee category', 500)
  }
}
