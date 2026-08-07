// ============================================================
// /api/subscriptions/payment/verify — Verify Subscription Payment
// ============================================================
// POST — Marks a pending payment as verified and, if the
//         subscription was in trial/grace_period/restricted/suspended,
//         updates it to 'active'. Extends the subscription endDate
//         based on the payment duration.
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  forbidden,
  getUserId,
} from '@/lib/api-utils'
import { computeEndDate, computeGracePeriodEnd, computeCurrentPeriodEnd, computeTenantCache, computeEnforcement } from '@/lib/subscription'

// Statuses that can be promoted to 'active' upon payment verification
const PROMOTABLE_STATUSES = new Set([
  'trial',
  'grace_period',
  'restricted',
  'suspended',
])

// -----------------------------------------------------------
// POST /api/subscriptions/payment/verify
// Body: { paymentId, tenantId, paymentRef, verifiedBy? }
// -----------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Validate required fields
    if (!body.paymentId) return error('paymentId is required')
    if (!body.tenantId) return error('tenantId is required')
    if (!body.paymentRef) return error('paymentRef is required (transaction reference from payment provider)')

    const paymentId = Number(body.paymentId)
    const tenantId = Number(body.tenantId)
    const paymentRef = String(body.paymentRef)
    const verifiedBy = body.verifiedBy ? Number(body.verifiedBy) : userId

    // Find the payment record
    const payment = await db.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    })

    if (!payment) {
      return notFound('Payment')
    }

    // Verify the payment belongs to the specified tenant
    if (payment.tenantId !== tenantId) {
      return forbidden('Payment does not belong to this tenant')
    }

    // Only pending payments can be verified
    if (payment.status !== 'pending') {
      return error(`Payment cannot be verified. Current status: ${payment.status}. Only pending payments can be verified.`)
    }

    const now = new Date()

    // Use a transaction to update payment and subscription atomically
    const result = await db.$transaction(async (tx) => {
      // Update payment to verified
      const updatedPayment = await tx.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          status: 'verified',
          paymentRef,
          verifiedBy,
          verifiedAt: now,
          paidAt: now,
        },
      })

      // Check if subscription should be promoted to active
      const subscription = payment.subscription
      let subscriptionUpdated = false
      let newEndDate: Date | null = null

      if (PROMOTABLE_STATUSES.has(subscription.status)) {
        // Compute new end date: extend from current date by the payment duration
        newEndDate = computeEndDate(now, payment.duration as 1 | 6 | 12)
        const newCurrentPeriodEnd = computeCurrentPeriodEnd(now, payment.duration as 1 | 6 | 12)
        const newGracePeriodEnd = computeGracePeriodEnd(newEndDate)

        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'active',
            endDate: newEndDate,
            currentPeriodEnd: newCurrentPeriodEnd,
            gracePeriodEnd: newGracePeriodEnd,
            paymentMethod: payment.paymentMethod,
            lastPaymentDate: now,
            lastPaymentMethod: payment.paymentMethod,
            lastPaymentRef: paymentRef,
            // If upgrading from trial, clear trialEnd
            ...(subscription.status === 'trial' ? { trialEnd: null } : {}),
          },
        })

        subscriptionUpdated = true
      } else if (subscription.status === 'active') {
        // Already active — extend the end date by the payment duration
        newEndDate = computeEndDate(subscription.endDate, payment.duration as 1 | 6 | 12)
        const newCurrentPeriodEnd = computeCurrentPeriodEnd(subscription.endDate, payment.duration as 1 | 6 | 12)
        const newGracePeriodEnd = computeGracePeriodEnd(newEndDate)

        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            endDate: newEndDate,
            currentPeriodEnd: newCurrentPeriodEnd,
            gracePeriodEnd: newGracePeriodEnd,
            paymentMethod: payment.paymentMethod,
            lastPaymentDate: now,
            lastPaymentMethod: payment.paymentMethod,
            lastPaymentRef: paymentRef,
          },
        })

        subscriptionUpdated = true
      }

      // Update tenant cache after payment verification
      const freshSub = await tx.subscription.findUnique({
        where: { id: subscription.id },
        include: { plan: true },
      })
      if (freshSub) {
        const enforcementResult = computeEnforcement({
          status: freshSub.status as any,
          startDate: freshSub.startDate,
          endDate: freshSub.endDate,
          currentPeriodEnd: freshSub.currentPeriodEnd,
          gracePeriodEnd: freshSub.gracePeriodEnd,
          restrictedEnd: freshSub.restrictedEnd,
          trialEnd: freshSub.trialEnd,
        })
        const tenantCache = computeTenantCache(enforcementResult)
        await tx.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionStatus: tenantCache.subscriptionStatus,
            isReadOnly: tenantCache.isReadOnly,
          },
        })
      }

      // Audit log
      await tx.activityLog.create({
        data: {
          tenantId,
          userId: verifiedBy,
          action: 'subscription.payment_verified',
          entityType: 'subscription_payment',
          entityId: paymentId,
          description: `Payment #${paymentId} verified with ref "${paymentRef}". ${subscriptionUpdated ? `Subscription #${subscription.id} updated.` : ''}`,
          metadata: {
            paymentId,
            paymentRef,
            subscriptionId: subscription.id,
            previousStatus: subscription.status,
            subscriptionUpdated,
            newEndDate: newEndDate?.toISOString(),
          },
        },
      })

      return {
        payment: updatedPayment,
        subscriptionUpdated,
        newStatus: subscriptionUpdated ? 'active' : subscription.status,
        newEndDate,
      }
    })

    return success(result, 'Payment verified successfully')
  } catch (e) {
    return error(String(e))
  }
}
