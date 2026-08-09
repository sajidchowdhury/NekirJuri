// ============================================================
// /api/guardians — List & Create
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, unauthorized, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'
import { guardianCreateSchema, formatZodError } from '@/lib/validations'

/** GET /api/guardians — List guardians with pagination and search */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

    // Search by name, phone, or nidNo
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { phone: { contains: params.search } },
        { nidNo: { contains: params.search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.guardian.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          studentGuardians: {
            include: {
              student: { select: { id: true, name: true, registrationNo: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.guardian.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/guardians — Create a new guardian */
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const body = await request.json()

    // Validate with Zod
    const parsed = guardianCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const guardian = await db.guardian.create({
      data: {
        tenantId,
        name: parsed.data.name,
        nameBn: parsed.data.nameBn || null,
        relationship: parsed.data.relationship,
        phone: parsed.data.phone,
        phoneAlt: parsed.data.phoneAlt || null,
        email: parsed.data.email || null,
        occupation: parsed.data.occupation || null,
        address: parsed.data.address || null,
        city: parsed.data.city || null,
        photoUrl: parsed.data.photoUrl || null,
        nidNo: parsed.data.nidNo || null,
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'Guardian',
      entityId: guardian.id,
      newValues: guardian,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return created(guardian)
  } catch (e) {
    return error(String(e))
  }
}
