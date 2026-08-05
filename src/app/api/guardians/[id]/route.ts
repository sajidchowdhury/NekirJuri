// ============================================================
// /api/guardians/[id] — Get, Update, Delete
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, unauthorized, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/guardians/:id — Get single guardian with student links */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const { id } = await context.params
    const guardianId = Number(id)

    const guardian = await db.guardian.findFirst({
      where: { id: guardianId, tenantId, deletedAt: null },
      include: {
        studentGuardians: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                registrationNo: true,
                classId: true,
                sectionId: true,
                status: true,
                class: { select: { id: true, name: true } },
                section: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    })

    if (!guardian) return notFound('Guardian')

    return success(guardian)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/guardians/:id — Update guardian (partial update) */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const guardianId = Number(id)

    const existing = await db.guardian.findFirst({
      where: { id: guardianId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Guardian')

    const body = await request.json()

    // Build update object with only provided fields
    const data: Record<string, unknown> = {}

    const updatableFields = [
      'name', 'nameBn', 'relationship', 'phone', 'phoneAlt',
      'email', 'occupation', 'address', 'city', 'photoUrl', 'nidNo',
    ]

    for (const field of updatableFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }

    const guardian = await db.guardian.update({
      where: { id: guardianId },
      data,
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'Guardian',
      entityId: guardianId,
      oldValues: existing,
      newValues: guardian,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(guardian)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/guardians/:id — Soft delete guardian */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const guardianId = Number(id)

    const existing = await db.guardian.findFirst({
      where: { id: guardianId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Guardian')

    const guardian = await db.guardian.update({
      where: { id: guardianId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'DELETE',
      entityType: 'Guardian',
      entityId: guardianId,
      oldValues: existing,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(guardian, 'Guardian deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
