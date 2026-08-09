// ============================================================
// /api/academic-sessions/[id] — Single Academic Session CRUD
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
import { academicSessionUpdateSchema, formatZodError } from '@/lib/validations'

/** GET /api/academic-sessions/[id] — Get single academic session */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const { id } = await params
    const sessionId = Number(id)
    if (isNaN(sessionId)) return error('Invalid session ID')

    const data = await db.academicSession.findFirst({
      where: { id: sessionId, tenantId },
      include: {
        classes: {
          include: {
            _count: { select: { sections: true, students: true } },
          },
        },
        _count: { select: { classes: true, students: true } },
      },
    })

    if (!data) return notFound('Academic session')
    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/academic-sessions/[id] — Update academic session */
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
    const sessionId = Number(id)
    if (isNaN(sessionId)) return error('Invalid session ID')

    const existing = await db.academicSession.findFirst({
      where: { id: sessionId, tenantId },
    })
    if (!existing) return notFound('Academic session')

    const body = await request.json()

    // Validate with Zod
    const parsed = academicSessionUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Validate date order if changing dates
    const newStartDate = parsed.data.startDate ? new Date(parsed.data.startDate) : existing.startDate
    const newEndDate = parsed.data.endDate ? new Date(parsed.data.endDate) : existing.endDate
    if (newStartDate >= newEndDate) {
      return error('Start date must be before end date')
    }

    // Check name uniqueness within tenant if changing name
    if (parsed.data.name && parsed.data.name !== existing.name) {
      const nameExists = await db.academicSession.findFirst({
        where: { tenantId, name: parsed.data.name, id: { not: sessionId } },
      })
      if (nameExists) return error('Academic session with this name already exists')
    }

    // If setting as current, unset others
    if (parsed.data.isCurrent && !existing.isCurrent) {
      await db.academicSession.updateMany({
        where: { tenantId, isCurrent: true },
        data: { isCurrent: false },
      })
    }

    const data = await db.academicSession.update({
      where: { id: sessionId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.startDate && { startDate: new Date(parsed.data.startDate) }),
        ...(parsed.data.endDate && { endDate: new Date(parsed.data.endDate) }),
        ...(parsed.data.isCurrent !== undefined && { isCurrent: parsed.data.isCurrent }),
        ...(parsed.data.status && { status: parsed.data.status }),
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'academic_session.updated',
        entityType: 'academic_session',
        entityId: sessionId,
        description: `Academic session "${data.name}" updated`,
      },
    })

    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/academic-sessions/[id] — Hard delete academic session */
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
    const sessionId = Number(id)
    if (isNaN(sessionId)) return error('Invalid session ID')

    const existing = await db.academicSession.findFirst({
      where: { id: sessionId, tenantId },
    })
    if (!existing) return notFound('Academic session')

    // Prevent deleting the current session
    if (existing.isCurrent) {
      return error('Cannot delete the current academic session. Set another session as current first.')
    }

    // Hard delete
    await db.academicSession.delete({ where: { id: sessionId } })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'academic_session.deleted',
        entityType: 'academic_session',
        entityId: sessionId,
        description: `Academic session "${existing.name}" deleted`,
      },
    })

    return success(null, 'Academic session deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
