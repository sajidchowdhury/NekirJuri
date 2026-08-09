// ============================================================
// /api/tenants/[id] — Single Tenant CRUD
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  unauthorized,
  getUserId,
} from '@/lib/api-utils'
import { tenantUpdateSchema, formatZodError } from '@/lib/validations'

/** GET /api/tenants/[id] — Get single tenant */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request)
    if (!userId) return unauthorized()

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || !user.isSuperAdmin) {
      return unauthorized('Super-admin access required')
    }

    const { id } = await params
    const tenantId = Number(id)
    if (isNaN(tenantId)) return error('Invalid tenant ID')

    const data = await db.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            users: true,
            students: true,
            teachers: true,
            classes: true,
          },
        },
      },
    })

    if (!data) return notFound('Tenant')
    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/tenants/[id] — Update tenant */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request)
    if (!userId) return unauthorized()

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || !user.isSuperAdmin) {
      return unauthorized('Super-admin access required')
    }

    const { id } = await params
    const tenantId = Number(id)
    if (isNaN(tenantId)) return error('Invalid tenant ID')

    const existing = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!existing) return notFound('Tenant')

    const body = await request.json()

    // Zod validation
    const parsed = tenantUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    // Check slug uniqueness if changing
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugExists = await db.tenant.findUnique({ where: { slug: parsed.data.slug } })
      if (slugExists) return error('Slug already exists')
    }

    // Check domain uniqueness if changing
    if (parsed.data.domain && parsed.data.domain !== existing.domain) {
      const domainExists = await db.tenant.findUnique({ where: { domain: parsed.data.domain } })
      if (domainExists) return error('Domain already in use')
    }

    const data = await db.tenant.update({
      where: { id: tenantId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.slug && { slug: parsed.data.slug }),
        ...(parsed.data.domain !== undefined && { domain: parsed.data.domain }),
        ...(parsed.data.logoUrl !== undefined && { logoUrl: parsed.data.logoUrl }),
        ...(parsed.data.address !== undefined && { address: parsed.data.address }),
        ...(parsed.data.city !== undefined && { city: parsed.data.city }),
        ...(parsed.data.state !== undefined && { state: parsed.data.state }),
        ...(parsed.data.country && { country: parsed.data.country }),
        ...(parsed.data.postalCode !== undefined && { postalCode: parsed.data.postalCode }),
        ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
        ...(parsed.data.email !== undefined && { email: parsed.data.email }),
        ...(parsed.data.website !== undefined && { website: parsed.data.website }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.settings !== undefined && { settings: parsed.data.settings }),
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'tenant.updated',
        entityType: 'tenant',
        entityId: tenantId,
        description: `Tenant "${data.name}" updated`,
      },
    })

    return success(data)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/tenants/[id] — Deactivate tenant (soft delete via isActive) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request)
    if (!userId) return unauthorized()

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || !user.isSuperAdmin) {
      return unauthorized('Super-admin access required')
    }

    const { id } = await params
    const tenantId = Number(id)
    if (isNaN(tenantId)) return error('Invalid tenant ID')

    const existing = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!existing) return notFound('Tenant')

    // Soft delete: deactivate the tenant
    const data = await db.tenant.update({
      where: { id: tenantId },
      data: { isActive: false },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'tenant.deactivated',
        entityType: 'tenant',
        entityId: tenantId,
        description: `Tenant "${existing.name}" deactivated`,
      },
    })

    return success(data, 'Tenant deactivated successfully')
  } catch (e) {
    return error(String(e))
  }
}
