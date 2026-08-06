// ============================================================
// /api/subscription-plans/[id] — Single Subscription Plan CRUD
// GET, PATCH (update), DELETE (soft)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  unauthorized,
  requireTenantId,
  getUserId,
} from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const { id } = await params

    const plan = await db.subscriptionPlan.findUnique({
      where: { id: Number(id) },
    })
    if (!plan) return notFound('Subscription plan')

    return success(plan)
  } catch (err) {
    console.error('[subscription-plans/[id]][GET]', err)
    return error('Failed to fetch subscription plan', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const planId = Number(id)

    const existing = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    })
    if (!existing) return notFound('Subscription plan')

    const body = await request.json()

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.subscriptionPlan.findUnique({
        where: { slug: body.slug },
      })
      if (slugConflict) return error('Plan slug already exists')
    }

    const updated = await db.subscriptionPlan.update({
      where: { id: planId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.priceMonthly !== undefined && { priceMonthly: Number(body.priceMonthly) }),
        ...(body.price6Monthly !== undefined && { price6Monthly: body.price6Monthly ? Number(body.price6Monthly) : null }),
        ...(body.priceYearly !== undefined && { priceYearly: body.priceYearly ? Number(body.priceYearly) : null }),
        ...(body.maxStudents !== undefined && { maxStudents: Number(body.maxStudents) }),
        ...(body.maxEmployees !== undefined && { maxEmployees: Number(body.maxEmployees) }),
        ...(body.maxStorageMb !== undefined && { maxStorageMb: Number(body.maxStorageMb) }),
        // CR-11: Gallery limit fields
        ...(body.maxAlbums !== undefined && { maxAlbums: Number(body.maxAlbums) }),
        ...(body.maxImagesPerAlbum !== undefined && { maxImagesPerAlbum: Number(body.maxImagesPerAlbum) }),
        ...(body.maxImageSizeMb !== undefined && { maxImageSizeMb: Number(body.maxImageSizeMb) }),
        ...(body.features !== undefined && { features: body.features }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'UPDATE',
        entityType: 'SubscriptionPlan',
        entityId: planId,
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(updated),
      },
    })

    return success(updated, 'Subscription plan updated successfully')
  } catch (err) {
    console.error('[subscription-plans/[id]][PATCH]', err)
    return error('Failed to update subscription plan', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const planId = Number(id)

    const existing = await db.subscriptionPlan.findUnique({
      where: { id: planId },
    })
    if (!existing) return notFound('Subscription plan')

    // Soft delete — set isActive = false
    await db.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'DELETE',
        entityType: 'SubscriptionPlan',
        entityId: planId,
        oldValues: JSON.stringify(existing),
      },
    })

    return success({ id: planId }, 'Subscription plan deactivated successfully')
  } catch (err) {
    console.error('[subscription-plans/[id]][DELETE]', err)
    return error('Failed to delete subscription plan', 500)
  }
}
