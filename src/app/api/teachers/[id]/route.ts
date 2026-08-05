// ============================================================
// /api/teachers/[id] — Get, Update, Delete
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, unauthorized, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/teachers/:id — Get single teacher with salary structures */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const { id } = await context.params
    const teacherId = Number(id)

    const teacher = await db.teacher.findFirst({
      where: { id: teacherId, tenantId, deletedAt: null },
      include: {
        classesAsTeacher: { select: { id: true, name: true, code: true } },
        sectionsAsInCharge: { select: { id: true, name: true } },
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    })

    if (!teacher) return notFound('Teacher')

    return success(teacher)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/teachers/:id — Update teacher (partial update) */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const teacherId = Number(id)

    const existing = await db.teacher.findFirst({
      where: { id: teacherId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Teacher')

    const body = await request.json()

    // Build update object with only provided fields
    const data: Record<string, unknown> = { updatedBy: userId }

    const fieldMap: Record<string, string> = {
      employeeIdNo: 'employeeIdNo',
      name: 'name',
      nameBn: 'nameBn',
      fatherName: 'fatherName',
      motherName: 'motherName',
      gender: 'gender',
      bloodGroup: 'bloodGroup',
      nationality: 'nationality',
      religion: 'religion',
      photoUrl: 'photoUrl',
      phone: 'phone',
      email: 'email',
      address: 'address',
      city: 'city',
      qualification: 'qualification',
      specialization: 'specialization',
      status: 'status',
    }

    for (const [bodyKey, schemaKey] of Object.entries(fieldMap)) {
      if (body[bodyKey] !== undefined) data[schemaKey] = body[bodyKey]
    }

    // Date fields
    if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
    if (body.joiningDate !== undefined) data.joiningDate = body.joiningDate ? new Date(body.joiningDate) : null
    if (body.leavingDate !== undefined) data.leavingDate = body.leavingDate ? new Date(body.leavingDate) : null

    const teacher = await db.teacher.update({
      where: { id: teacherId },
      data,
      include: {
        classesAsTeacher: { select: { id: true, name: true, code: true } },
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'Teacher',
      entityId: teacherId,
      oldValues: existing,
      newValues: teacher,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(teacher)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/teachers/:id — Soft delete teacher */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const teacherId = Number(id)

    const existing = await db.teacher.findFirst({
      where: { id: teacherId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Teacher')

    const teacher = await db.teacher.update({
      where: { id: teacherId },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: userId,
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'DELETE',
      entityType: 'Teacher',
      entityId: teacherId,
      oldValues: existing,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(teacher, 'Teacher deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
