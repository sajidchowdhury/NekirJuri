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
import { subscriptionPlanCreateSchema, formatZodError } from '@/lib/validations'

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

    // Zod validation
    const parsed = subscriptionPlanCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    // CR-11: Gallery limit fields (with sensible defaults)
    const maxAlbums = parsed.data.maxAlbums ?? 5
    const maxImagesPerAlbum = parsed.data.maxImagesPerAlbum ?? 20
    const maxImageSizeMb = parsed.data.maxImageSizeMb ?? 2

    // Check slug uniqueness
    const existing = await db.subscriptionPlan.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) {
      return error('Plan slug already exists')
    }

    const data = await db.subscriptionPlan.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        priceMonthly: Number(parsed.data.priceMonthly),
        price6Monthly: parsed.data.price6Monthly ? Number(parsed.data.price6Monthly) : null,
        priceYearly: parsed.data.priceYearly ? Number(parsed.data.priceYearly) : null,
        maxStudents: Number(parsed.data.maxStudents),
        maxEmployees: Number(parsed.data.maxEmployees),
        maxStorageMb: Number(parsed.data.maxStorageMb),
        // CR-11: Gallery limits
        maxAlbums,
        maxImagesPerAlbum,
        maxImageSizeMb,
        features: parsed.data.features || null,
        isActive: parsed.data.isActive !== undefined ? parsed.data.isActive : true,
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
