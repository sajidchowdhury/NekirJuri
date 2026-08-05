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

    // Check slug uniqueness if changing
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await db.tenant.findUnique({ where: { slug: body.slug } })
      if (slugExists) return error('Slug already exists')
    }

    // Check domain uniqueness if changing
    if (body.domain && body.domain !== existing.domain) {
      const domainExists = await db.tenant.findUnique({ where: { domain: body.domain } })
      if (domainExists) return error('Domain already in use')
    }

    const data = await db.tenant.update({
      where: { id: tenantId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.domain !== undefined && { domain: body.domain }),
        ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.state !== undefined && { state: body.state }),
        ...(body.country && { country: body.country }),
        ...(body.postalCode !== undefined && { postalCode: body.postalCode }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.settings !== undefined && { settings: body.settings }),
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
