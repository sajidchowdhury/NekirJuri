// ============================================================
// /api/academic-sessions — Academic Session Management
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

/** GET /api/academic-sessions — List academic sessions for tenant */
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

    // Filter by status
    const status = url.searchParams.get('status')
    if (status) {
      where.status = status
    }

    // Filter by isCurrent
    const isCurrent = url.searchParams.get('isCurrent')
    if (isCurrent !== null) {
      where.isCurrent = isCurrent === 'true'
    }

    const [data, total] = await Promise.all([
      db.academicSession.findMany({
        where,
        skip: (params.page! - 1) * params.limit!,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { classes: true, students: true } },
        },
      }),
      db.academicSession.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/academic-sessions — Create academic session */
export async function POST(request: NextRequest) {
  try {
    const tenantResult = requireTenantId(request)
    if (tenantResult instanceof Response) return tenantResult
    const tenantId = tenantResult

    const userId = getUserId(request)
    const body = await request.json()

    // Validate required fields
    if (!body.name) return error('Name is required')
    if (!body.startDate) return error('Start date is required')
    if (!body.endDate) return error('End date is required')

    // Check date order
    if (new Date(body.startDate) >= new Date(body.endDate)) {
      return error('Start date must be before end date')
    }

    // Check unique name within tenant
    const existing = await db.academicSession.findFirst({
      where: { tenantId, name: body.name },
    })
    if (existing) {
      return error('Academic session with this name already exists')
    }

    // If setting as current, unset others
    if (body.isCurrent) {
      await db.academicSession.updateMany({
        where: { tenantId, isCurrent: true },
        data: { isCurrent: false },
      })
    }

    const data = await db.academicSession.create({
      data: {
        tenantId,
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        isCurrent: body.isCurrent || false,
        status: body.status || 'upcoming',
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'academic_session.created',
        entityType: 'academic_session',
        entityId: data.id,
        description: `Academic session "${data.name}" created`,
      },
    })

    return created(data)
  } catch (e) {
    return error(String(e))
  }
}
