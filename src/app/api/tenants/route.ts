// ============================================================
// /api/tenants — Tenant Management (Super-Admin)
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
  getUserId,
} from '@/lib/api-utils'

/** GET /api/tenants — List all tenants (super-admin only) */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) return unauthorized()

    // Super-admin check: user with isSuperAdmin flag
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || !user.isSuperAdmin) {
      return unauthorized('Super-admin access required')
    }

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    const where: Record<string, unknown> = {}

    // Search by name, slug, or email
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { slug: { contains: params.search } },
        { email: { contains: params.search } },
      ]
    }

    // Filter by active status
    const isActive = url.searchParams.get('isActive')
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const [data, total] = await Promise.all([
      db.tenant.findMany({
        where,
        skip: (params.page! - 1) * params.limit!,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            where: { status: 'active' },
            take: 1,
            include: { plan: true },
          },
          _count: { select: { users: true, students: true } },
        },
      }),
      db.tenant.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/tenants — Create a new tenant */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    if (!userId) return unauthorized()

    // Super-admin check
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || !user.isSuperAdmin) {
      return unauthorized('Super-admin access required')
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.slug) {
      return error('Name and slug are required')
    }

    // Check slug uniqueness
    const existing = await db.tenant.findUnique({ where: { slug: body.slug } })
    if (existing) {
      return error('Slug already exists')
    }

    // Check domain uniqueness if provided
    if (body.domain) {
      const domainExists = await db.tenant.findUnique({ where: { domain: body.domain } })
      if (domainExists) {
        return error('Domain already in use')
      }
    }

    const data = await db.tenant.create({
      data: {
        name: body.name,
        slug: body.slug,
        domain: body.domain || null,
        logoUrl: body.logoUrl || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || 'Bangladesh',
        postalCode: body.postalCode || null,
        phone: body.phone || null,
        email: body.email || null,
        website: body.website || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        settings: body.settings || null,
      },
    })

    // Audit log — use the new tenant's ID for the log
    await db.activityLog.create({
      data: {
        tenantId: data.id,
        userId,
        action: 'tenant.created',
        entityType: 'tenant',
        entityId: data.id,
        description: `Tenant "${data.name}" created`,
      },
    })

    return created(data)
  } catch (e) {
    return error(String(e))
  }
}
