// ============================================================
// /api/sections — Section Management
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

/** GET /api/sections — List sections for tenant, filter by classId */
export async function GET(request: NextRequest) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    const where: Record<string, unknown> = { tenantId }

    // Search by name
    if (params.search) {
      where.name = { contains: params.search }
    }

    // Filter by classId
    const classId = url.searchParams.get('classId')
    if (classId) {
      where.classId = Number(classId)
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
      db.section.findMany({
        where,
        skip: (params.page! - 1) * params.limit!,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              code: true,
              academicSession: { select: { id: true, name: true } },
            },
          },
          sectionInCharge: { select: { id: true, name: true, employeeIdNo: true } },
          _count: { select: { students: true } },
        },
      }),
      db.section.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/sections — Create a section */
export async function POST(request: NextRequest) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const userId = getUserId(request)
    const body = await request.json()

    // Validate required fields
    if (!body.classId) return error('Class ID is required')
    if (!body.name) return error('Name is required')

    // Verify class belongs to tenant
    const cls = await db.class.findFirst({
      where: { id: Number(body.classId), tenantId },
    })
    if (!cls) return error('Class not found or does not belong to this tenant')

    // Verify teacher belongs to tenant if provided
    if (body.teacherId) {
      const teacher = await db.teacher.findFirst({
        where: { id: Number(body.teacherId), tenantId, deletedAt: null },
      })
      if (!teacher) return error('Teacher not found or does not belong to this tenant')
    }

    // Check unique (tenantId + classId + name)
    const existing = await db.section.findFirst({
      where: {
        tenantId,
        classId: Number(body.classId),
        name: body.name,
      },
    })
    if (existing) return error('Section with this name already exists in this class')

    const data = await db.section.create({
      data: {
        tenantId,
        classId: Number(body.classId),
        name: body.name,
        teacherId: body.teacherId ? Number(body.teacherId) : null,
        capacity: body.capacity ? Number(body.capacity) : null,
        status: body.status || 'active',
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'section.created',
        entityType: 'section',
        entityId: data.id,
        description: `Section "${data.name}" created for class "${cls.name}"`,
      },
    })

    return created(data)
  } catch (e) {
    return error(String(e))
  }
}
