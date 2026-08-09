// ============================================================
// /api/sections/[id] — Single Section CRUD
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  unauthorized,
  getTenantId,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'
import { sectionUpdateSchema, formatZodError } from '@/lib/validations'

/** GET /api/sections/[id] — Get single section */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const { id } = await params
    const sectionId = Number(id)
    if (isNaN(sectionId)) return error('Invalid section ID')

    const data = await db.section.findFirst({
      where: { id: sectionId, tenantId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            code: true,
            academicSession: { select: { id: true, name: true, status: true } },
          },
        },
        sectionInCharge: { select: { id: true, name: true, employeeIdNo: true } },
        _count: { select: { students: true } },
      },
    })

    if (!data) return notFound('Section')
    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/sections/[id] — Update section */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const userId = getUserId(request)
    const { id } = await params
    const sectionId = Number(id)
    if (isNaN(sectionId)) return error('Invalid section ID')

    const existing = await db.section.findFirst({
      where: { id: sectionId, tenantId },
    })
    if (!existing) return notFound('Section')

    const body = await request.json()

    // Validate with Zod
    const parsed = sectionUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Verify class belongs to tenant if changing
    if (parsed.data.classId) {
      const cls = await db.class.findFirst({
        where: { id: parsed.data.classId, tenantId },
      })
      if (!cls) return error('Class not found or does not belong to this tenant')
    }

    // Verify teacher belongs to tenant if changing
    if (parsed.data.teacherId) {
      const teacher = await db.teacher.findFirst({
        where: { id: parsed.data.teacherId, tenantId, deletedAt: null },
      })
      if (!teacher) return error('Teacher not found or does not belong to this tenant')
    }

    // Check unique (tenantId + classId + name) if name or classId is changing
    const newName = parsed.data.name || existing.name
    const newClassId = parsed.data.classId || existing.classId
    if ((parsed.data.name && parsed.data.name !== existing.name) || (parsed.data.classId && parsed.data.classId !== existing.classId)) {
      const nameExists = await db.section.findFirst({
        where: {
          tenantId,
          classId: newClassId,
          name: newName,
          id: { not: sectionId },
        },
      })
      if (nameExists) return error('Section with this name already exists in this class')
    }

    const data = await db.section.update({
      where: { id: sectionId },
      data: {
        ...(parsed.data.classId && { classId: parsed.data.classId }),
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.teacherId !== undefined && { teacherId: parsed.data.teacherId ?? null }),
        ...(parsed.data.capacity !== undefined && { capacity: parsed.data.capacity ?? null }),
        ...(parsed.data.status && { status: parsed.data.status }),
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'section.updated',
        entityType: 'section',
        entityId: sectionId,
        description: `Section "${data.name}" updated`,
      },
    })

    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/sections/[id] — Hard delete section */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const userId = getUserId(request)
    const { id } = await params
    const sectionId = Number(id)
    if (isNaN(sectionId)) return error('Invalid section ID')

    const existing = await db.section.findFirst({
      where: { id: sectionId, tenantId },
      include: { _count: { select: { students: true } } },
    })
    if (!existing) return notFound('Section')

    // Prevent deleting section with students
    if (existing._count.students > 0) {
      return error('Cannot delete section with enrolled students. Remove students first.')
    }

    // Hard delete
    await db.section.delete({ where: { id: sectionId } })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'section.deleted',
        entityType: 'section',
        entityId: sectionId,
        description: `Section "${existing.name}" deleted`,
      },
    })

    return success(null, 'Section deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
