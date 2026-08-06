// ============================================================
// /api/subscriptions/check — Check Subscription Enforcement
// ============================================================
// GET — Returns the enforcement result for a tenant, indicating
//       what access level they have, any warnings, and plan limits.
//       This is the primary endpoint used by middleware/guards to
//       determine if a tenant can access a feature.
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  getTenantId,
} from '@/lib/api-utils'
import { computeEnforcement } from '@/lib/subscription'

// -----------------------------------------------------------
// GET /api/subscriptions/check?tenantId=1
// -----------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantIdParam = url.searchParams.get('tenantId')
    if (!tenantIdParam) return error('tenantId query parameter is required')

    const tenantId = Number(tenantIdParam)
    if (isNaN(tenantId)) return error('tenantId must be a valid number')

    // Also check header-based tenant ID for auth consistency
    const headerTenantId = getTenantId(request)
    if (headerTenantId && headerTenantId !== tenantId) {
      return error('Tenant ID mismatch')
    }

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return notFound('Tenant')

    // Find the current active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        tenantId,
        status: { notIn: ['cancelled', 'terminated'] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    // No subscription at all — fully blocked
    if (!subscription) {
      return success({
        level: 'blocked',
        status: 'none',
        isExpired: true,
        isInTrial: false,
        daysRemaining: 0,
        trialDaysRemaining: 0,
        warnings: ['No active subscription found. Please subscribe to access the system.'],
        features: [],
        maxStudents: 0,
        maxEmployees: 0,
        maxStorageMb: 0,
        maxAlbums: 0,
        maxImagesPerAlbum: 0,
        maxImageSizeMb: 0,
      })
    }

    // Compute enforcement level
    const enforcement = computeEnforcement({
      status: subscription.status as 'trial' | 'active' | 'grace_period' | 'restricted' | 'suspended' | 'terminated' | 'cancelled',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      trialEnd: subscription.trialEnd,
      features: subscription.plan.features as string[] | undefined,
      maxStudents: subscription.plan.maxStudents,
      maxEmployees: subscription.plan.maxEmployees,
      maxStorageMb: subscription.plan.maxStorageMb,
      maxAlbums: subscription.plan.maxAlbums,
      maxImagesPerAlbum: subscription.plan.maxImagesPerAlbum,
      maxImageSizeMb: subscription.plan.maxImageSizeMb,
    })

    return success(enforcement)
  } catch (e) {
    return error(String(e))
  }
}
