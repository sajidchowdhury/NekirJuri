// ============================================================
// /api/subscription-plans — Subscription Plan Management
// ============================================================
// SubscriptionPlan is a global (non-tenant-scoped) resource.

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  unauthorized,
  notFound,
  paginated,
  getPaginationParams,
  getTenantId,
  getUserId,
} from '@/lib/api-utils'

/** GET /api/subscription-plans — List all subscription plans */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    const where: Record<string, unknown> = {}

    // Search by name or slug
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { slug: { contains: params.search } },
      ]
    }

    // Filter by active status
    const isActive = url.searchParams.get('isActive')
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [data, total] = await Promise.all([
      db.subscriptionPlan.findMany({
        where,
        skip: (params.page! - 1) * params.limit!,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.subscriptionPlan.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/subscription-plans — Create a subscription plan */
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.slug) {
      return error('Name and slug are required')
    }
    if (body.priceMonthly === undefined || body.priceMonthly === null) {
      return error('priceMonthly is required')
    }
    if (!body.maxStudents || !body.maxEmployees || !body.maxStorageMb) {
      return error('maxStudents, maxEmployees, and maxStorageMb are required')
    }

    // Check slug uniqueness
    const existing = await db.subscriptionPlan.findUnique({ where: { slug: body.slug } })
    if (existing) {
      return error('Plan slug already exists')
    }

    const data = await db.subscriptionPlan.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        priceMonthly: Number(body.priceMonthly),
        priceYearly: body.priceYearly ? Number(body.priceYearly) : null,
        maxStudents: Number(body.maxStudents),
        maxEmployees: Number(body.maxEmployees),
        maxStorageMb: Number(body.maxStorageMb),
        features: body.features || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'subscription_plan.created',
        entityType: 'subscription_plan',
        entityId: data.id,
        description: `Subscription plan "${data.name}" created`,
      },
    })

    return created(data)
  } catch (e) {
    return error(String(e))
  }
}
