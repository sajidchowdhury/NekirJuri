// ============================================================
// Donation Categories API — GET (list), POST (create)
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
import { donationCategoryCreateSchema, formatZodError } from '@/lib/validations'

// --- GET: List donation categories with pagination & search ---
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
        { description: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.donationCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
      }),
      db.donationCategory.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[donation-categories][GET]', err)
    return error('Failed to fetch donation categories', 500)
  }
}

// --- POST: Create donation category ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = donationCategoryCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const { name, description, isActive } = parsed.data

    const record = await db.donationCategory.create({
      data: {
        tenantId: tid,
        name,
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
        entityType: 'DonationCategory',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[donation-categories][POST]', err)
    return error('Failed to create donation category', 500)
  }
}
