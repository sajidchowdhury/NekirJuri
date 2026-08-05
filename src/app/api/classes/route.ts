// ============================================================
// /api/classes — Class Management
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  unauthorized,
  paginated,
  getPaginationParams,
  getTenantId,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'

/** GET /api/classes — List classes for tenant with search & filters */
export async function GET(request: NextRequest) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    const where: Record<string, unknown> = { tenantId }

    // Search by name or code
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { code: { contains: params.search } },
      ]
    }

    // Filter by academicSessionId
    const academicSessionId = url.searchParams.get('academicSessionId')
    if (academicSessionId) {
      where.academicSessionId = Number(academicSessionId)
    }

    // Filter by status
    const status = url.searchParams.get('status')
    if (status) {
      where.status = status
    }

    // Filter by teacherId
    const teacherId = url.searchParams.get('teacherId')
    if (teacherId) {
      where.teacherId = Number(teacherId)
    }

    const [data, total] = await Promise.all([
      db.class.findMany({
        where,
        skip: (params.page! - 1) * params.limit!,
        take: params.limit,
        orderBy: { orderSequence: 'asc' },
        include: {
          academicSession: { select: { id: true, name: true, status: true } },
          classTeacher: { select: { id: true, name: true } },
          _count: { select: { sections: true, students: true } },
        },
      }),
      db.class.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/classes — Create a class */
export async function POST(request: NextRequest) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const userId = getUserId(request)
    const body = await request.json()

    // Validate required fields
    if (!body.name) return error('Name is required')
    if (!body.code) return error('Code is required')
    if (!body.orderSequence) return error('Order sequence is required')
    if (!body.academicSessionId) return error('Academic session ID is required')

    // Verify academic session belongs to tenant
    const session = await db.academicSession.findFirst({
      where: { id: Number(body.academicSessionId), tenantId },
    })
    if (!session) return error('Academic session not found or does not belong to this tenant')

    // Verify teacher belongs to tenant if provided
    if (body.teacherId) {
      const teacher = await db.teacher.findFirst({
        where: { id: Number(body.teacherId), tenantId, deletedAt: null },
      })
      if (!teacher) return error('Teacher not found or does not belong to this tenant')
    }

    // Check unique (tenantId + code + academicSessionId)
    const existing = await db.class.findFirst({
      where: {
        tenantId,
        code: body.code,
        academicSessionId: Number(body.academicSessionId),
      },
    })
    if (existing) return error('Class with this code already exists in this academic session')

    const data = await db.class.create({
      data: {
        tenantId,
        name: body.name,
        code: body.code,
        orderSequence: Number(body.orderSequence),
        academicSessionId: Number(body.academicSessionId),
        teacherId: body.teacherId ? Number(body.teacherId) : null,
        capacity: body.capacity ? Number(body.capacity) : null,
        description: body.description || null,
        status: body.status || 'active',
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'class.created',
        entityType: 'class',
        entityId: data.id,
        description: `Class "${data.name}" (${data.code}) created`,
      },
    })

    return created(data)
  } catch (e) {
    return error(String(e))
  }
}
