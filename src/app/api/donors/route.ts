// ============================================================
// Donors API — GET (list with search), POST (create)
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
import { donorCreateSchema, formatZodError } from '@/lib/validations'

// --- GET: List donors with pagination & multi-field search ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const isRegular = url.searchParams.get('isRegular')
    const isActive = url.searchParams.get('isActive')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      tenantId: tid,
      deletedAt: null,
    }
    if (isRegular !== null && isRegular !== undefined && isRegular !== '') {
      where.isRegular = isRegular === 'true'
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { organization: { contains: search } },
        { nidNo: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.donor.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          _count: { select: { donations: true } },
        },
      }),
      db.donor.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[donors][GET]', err)
    return error('Failed to fetch donors', 500)
  }
}

// --- POST: Create donor ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = donorCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const {
      name,
      phone,
      email,
      address,
      occupation,
      organization,
      nidNo,
      isRegular,
      remarks,
      isActive,
    } = parsed.data

    const record = await db.donor.create({
      data: {
        tenantId: tid,
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        occupation: occupation || null,
        organization: organization || null,
        nidNo: nidNo || null,
        isRegular: isRegular ?? false,
        remarks: remarks || null,
        isActive: isActive ?? true,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'Donor',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[donors][POST]', err)
    return error('Failed to create donor', 500)
  }
}
