// ============================================================
// /api/subscriptions — Subscription Management
// ============================================================
// GET  — Retrieve the current tenant's active subscription with
//        plan details, enforcement status, and payment history.
// POST — Create, renew, or upgrade a subscription.
//        If upgrading, the existing subscription is cancelled first.
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  unauthorized,
  notFound,
  getTenantId,
  getUserId,
} from '@/lib/api-utils'
import {
  computeEnforcement,
  computeTenantCache,
  computeEndDate,
  computeGracePeriodEnd,
  computeCurrentPeriodEnd,
  computeBillingPeriod,
  computePrice,
  type BillingDuration,
  type PaymentMethod,
} from '@/lib/subscription'
import { subscriptionCreateSchema, formatZodError } from '@/lib/validations'

// -----------------------------------------------------------
// GET /api/subscriptions?tenantId=1
// -----------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const tenantIdParam = url.searchParams.get('tenantId')
    if (!tenantIdParam) return error('tenantId query parameter is required')

    const tenantId = Number(tenantIdParam)
    if (isNaN(tenantId)) return error('tenantId must be a valid number')

    // Also check header-based tenant ID for auth
    const headerTenantId = getTenantId(request)
    if (headerTenantId && headerTenantId !== tenantId) {
      return unauthorized('Tenant ID mismatch')
    }

    // Find the current (non-cancelled/terminated) subscription for this tenant
    const subscription = await db.subscription.findFirst({
      where: {
        tenantId,
        status: { notIn: ['cancelled', 'terminated'] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return notFound('Subscription')
    }

    // Fetch payment history separately
    const payments = await db.subscriptionPayment.findMany({
      where: { subscriptionId: subscription.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Compute enforcement level using new schema fields
    const enforcement = computeEnforcement({
      status: subscription.status as 'trial' | 'active' | 'grace_period' | 'restricted' | 'suspended' | 'terminated' | 'cancelled',
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      currentPeriodEnd: subscription.currentPeriodEnd,
      gracePeriodEnd: subscription.gracePeriodEnd,
      restrictedEnd: subscription.restrictedEnd,
      trialEnd: subscription.trialEnd,
      features: subscription.plan.features as string[] | undefined,
      maxStudents: subscription.plan.maxStudents,
      maxEmployees: subscription.plan.maxEmployees,
      maxStorageMb: subscription.plan.maxStorageMb,
    })

    return success({
      subscription,
      payments,
      enforcement,
    })
  } catch (e) {
    return error(String(e))
  }
}

// -----------------------------------------------------------
// POST /api/subscriptions
// Body: { tenantId, planId, duration: 1|6|12, paymentMethod: 'bkash'|'nagad'|'bank'|'manual' }
// -----------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Zod validation
    const parsed = subscriptionCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    if (!body.tenantId) return error('tenantId is required')
    const tenantId = Number(body.tenantId)
    const planId = Number(parsed.data.planId)
    const duration = parsed.data.billingDuration as BillingDuration
    const paymentMethod = (parsed.data.paymentMethod || 'bkash') as PaymentMethod

    // Verify tenant exists
    const tenant = await db.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) return notFound('Tenant')

    // Verify plan exists and is active
    const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } })
    if (!plan) return notFound('Subscription plan')
    if (!plan.isActive) return error('This subscription plan is not available')

    // Compute pricing
    const amount = computePrice(
      Number(plan.priceMonthly),
      plan.price6Monthly ? Number(plan.price6Monthly) : null,
      plan.priceYearly ? Number(plan.priceYearly) : null,
      duration,
    )

    const now = new Date()
    const startDate = now
    const endDate = computeEndDate(startDate, duration)
    const billingPeriod = computeBillingPeriod(startDate, duration)

    // Use a transaction to handle upgrade logic atomically
    const result = await db.$transaction(async (tx) => {
      // Check for existing active subscription (upgrade scenario)
      const existingSub = await tx.subscription.findFirst({
        where: {
          tenantId,
          status: { notIn: ['cancelled', 'terminated'] },
        },
        orderBy: { createdAt: 'desc' },
      })

      let isUpgrade = false
      let previousPlanId: number | null = null

      if (existingSub) {
        // If same plan, this is a renewal; if different plan, it's an upgrade
        if (existingSub.planId !== planId) {
          isUpgrade = true
          previousPlanId = existingSub.planId
        }

        // Cancel existing subscription
        await tx.subscription.update({
          where: { id: existingSub.id },
          data: { status: 'cancelled' },
        })
      }

      // Determine initial status — if amount is 0 (free plan), go directly to active
      const initialStatus = amount === 0 ? 'active' : 'trial'
      const trialEnd = amount === 0 ? null : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14-day trial
      const currentPeriodEnd = computeCurrentPeriodEnd(startDate, duration)
      const gracePeriodEnd = computeGracePeriodEnd(endDate)

      // Create new subscription with all CR-7 fields
      const subscription = await tx.subscription.create({
        data: {
          tenantId,
          planId,
          status: initialStatus,
          billingDuration: duration,
          paymentMethod,
          startDate,
          endDate,
          currentPeriodEnd,
          gracePeriodEnd,
          trialEnd,
          isAutoRenew: false,
        },
        include: { plan: true },
      })

      // Create payment record if amount > 0
      let payment = null
      if (amount > 0) {
        payment = await tx.subscriptionPayment.create({
          data: {
            subscriptionId: subscription.id,
            tenantId,
            amount,
            currency: 'BDT',
            paymentMethod,
            status: 'pending',
            billingPeriod,
            duration,
          },
        })
      }

      // Update tenant cache to reflect new subscription
      const enforcementResult = computeEnforcement({
        status: initialStatus as any,
        startDate,
        endDate,
        currentPeriodEnd,
        gracePeriodEnd,
        trialEnd,
        features: (plan.features as string[]) ?? [],
        maxStudents: plan.maxStudents,
        maxEmployees: plan.maxEmployees,
        maxStorageMb: plan.maxStorageMb,
      })
      const tenantCache = computeTenantCache(enforcementResult)
      await tx.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: tenantCache.subscriptionStatus,
          isReadOnly: tenantCache.isReadOnly,
        },
      })

      // Audit log
      await tx.activityLog.create({
        data: {
          tenantId,
          userId,
          action: isUpgrade ? 'subscription.upgraded' : 'subscription.created',
          entityType: 'subscription',
          entityId: subscription.id,
          description: isUpgrade
            ? `Subscription upgraded from plan #${previousPlanId} to "${plan.name}"`
            : `Subscription created for plan "${plan.name}" (${duration} month(s))`,
          metadata: {
            planId,
            duration,
            paymentMethod,
            amount,
            isUpgrade,
            previousPlanId,
          },
        },
      })

      return { subscription, payment, isUpgrade }
    })

    return created(result, result.isUpgrade ? 'Subscription upgraded successfully' : 'Subscription created successfully')
  } catch (e) {
    return error(String(e))
  }
}
