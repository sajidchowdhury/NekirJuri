// ============================================================
// /api/classes/[id] — Single Class CRUD
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
import { classUpdateSchema, formatZodError } from '@/lib/validations'

/** GET /api/classes/[id] — Get single class */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const { id } = await params
    const classId = Number(id)
    if (isNaN(classId)) return error('Invalid class ID')

    const data = await db.class.findFirst({
      where: { id: classId, tenantId },
      include: {
        academicSession: { select: { id: true, name: true, status: true, isCurrent: true } },
        classTeacher: { select: { id: true, name: true, employeeIdNo: true } },
        sections: {
          include: {
            sectionInCharge: { select: { id: true, name: true } },
            _count: { select: { students: true } },
          },
        },
        _count: { select: { students: true } },
      },
    })

    if (!data) return notFound('Class')
    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/classes/[id] — Update class */
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
    const classId = Number(id)
    if (isNaN(classId)) return error('Invalid class ID')

    const existing = await db.class.findFirst({
      where: { id: classId, tenantId },
    })
    if (!existing) return notFound('Class')

    const body = await request.json()

    // Validate with Zod
    const parsed = classUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Verify teacher belongs to tenant if changing
    if (parsed.data.teacherId) {
      const teacher = await db.teacher.findFirst({
        where: { id: parsed.data.teacherId, tenantId, deletedAt: null },
      })
      if (!teacher) return error('Teacher not found or does not belong to this tenant')
    }

    // Check unique code+session if changing code or academicSessionId
    const newCode = parsed.data.code || existing.code
    const newSessionId = parsed.data.academicSessionId || existing.academicSessionId
    if ((parsed.data.code && parsed.data.code !== existing.code) || (parsed.data.academicSessionId && parsed.data.academicSessionId !== existing.academicSessionId)) {
      const codeExists = await db.class.findFirst({
        where: {
          tenantId,
          code: newCode,
          academicSessionId: newSessionId,
          id: { not: classId },
        },
      })
      if (codeExists) return error('Class with this code already exists in this academic session')
    }

    // Verify academic session belongs to tenant if changing
    if (parsed.data.academicSessionId) {
      const session = await db.academicSession.findFirst({
        where: { id: parsed.data.academicSessionId, tenantId },
      })
      if (!session) return error('Academic session not found or does not belong to this tenant')
    }

    const data = await db.class.update({
      where: { id: classId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.code && { code: parsed.data.code }),
        ...(parsed.data.orderSequence !== undefined && { orderSequence: parsed.data.orderSequence }),
        ...(parsed.data.academicSessionId && { academicSessionId: parsed.data.academicSessionId }),
        ...(parsed.data.teacherId !== undefined && { teacherId: parsed.data.teacherId ?? null }),
        ...(parsed.data.capacity !== undefined && { capacity: parsed.data.capacity ?? null }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description }),
        ...(parsed.data.status && { status: parsed.data.status }),
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'class.updated',
        entityType: 'class',
        entityId: classId,
        description: `Class "${data.name}" (${data.code}) updated`,
      },
    })

    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/classes/[id] — Hard delete class */
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
    const classId = Number(id)
    if (isNaN(classId)) return error('Invalid class ID')

    const existing = await db.class.findFirst({
      where: { id: classId, tenantId },
      include: { _count: { select: { students: true } } },
    })
    if (!existing) return notFound('Class')

    // Prevent deleting class with students
    if (existing._count.students > 0) {
      return error('Cannot delete class with enrolled students. Remove students first.')
    }

    // Hard delete (cascades will remove sections)
    await db.class.delete({ where: { id: classId } })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'class.deleted',
        entityType: 'class',
        entityId: classId,
        description: `Class "${existing.name}" (${existing.code}) deleted`,
      },
    })

    return success(null, 'Class deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
