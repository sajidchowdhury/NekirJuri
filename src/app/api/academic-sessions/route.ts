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
import { academicSessionCreateSchema, formatZodError } from '@/lib/validations'

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

    // Validate with Zod
    const parsed = academicSessionCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Check date order
    if (new Date(parsed.data.startDate) >= new Date(parsed.data.endDate)) {
      return error('Start date must be before end date')
    }

    // Check unique name within tenant
    const existing = await db.academicSession.findFirst({
      where: { tenantId, name: parsed.data.name },
    })
    if (existing) {
      return error('Academic session with this name already exists')
    }

    // If setting as current, unset others
    if (parsed.data.isCurrent) {
      await db.academicSession.updateMany({
        where: { tenantId, isCurrent: true },
        data: { isCurrent: false },
      })
    }

    const data = await db.academicSession.create({
      data: {
        tenantId,
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        isCurrent: parsed.data.isCurrent || false,
        status: parsed.data.status || 'upcoming',
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
