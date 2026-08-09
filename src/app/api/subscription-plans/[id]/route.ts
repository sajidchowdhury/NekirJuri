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
import { subscriptionPlanUpdateSchema, formatZodError } from '@/lib/validations'

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

    // Zod validation
    const parsed = subscriptionPlanUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    // If slug is being changed, check uniqueness
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugConflict = await db.subscriptionPlan.findUnique({
        where: { slug: parsed.data.slug },
      })
      if (slugConflict) return error('Plan slug already exists')
    }

    const updated = await db.subscriptionPlan.update({
      where: { id: planId },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.slug !== undefined && { slug: parsed.data.slug }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description || null }),
        ...(parsed.data.priceMonthly !== undefined && { priceMonthly: Number(parsed.data.priceMonthly) }),
        ...(parsed.data.price6Monthly !== undefined && { price6Monthly: parsed.data.price6Monthly ? Number(parsed.data.price6Monthly) : null }),
        ...(parsed.data.priceYearly !== undefined && { priceYearly: parsed.data.priceYearly ? Number(parsed.data.priceYearly) : null }),
        ...(parsed.data.maxStudents !== undefined && { maxStudents: Number(parsed.data.maxStudents) }),
        ...(parsed.data.maxEmployees !== undefined && { maxEmployees: Number(parsed.data.maxEmployees) }),
        ...(parsed.data.maxStorageMb !== undefined && { maxStorageMb: Number(parsed.data.maxStorageMb) }),
        // CR-11: Gallery limit fields
        ...(parsed.data.maxAlbums !== undefined && { maxAlbums: Number(parsed.data.maxAlbums) }),
        ...(parsed.data.maxImagesPerAlbum !== undefined && { maxImagesPerAlbum: Number(parsed.data.maxImagesPerAlbum) }),
        ...(parsed.data.maxImageSizeMb !== undefined && { maxImageSizeMb: Number(parsed.data.maxImageSizeMb) }),
        ...(parsed.data.features !== undefined && { features: parsed.data.features }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
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
