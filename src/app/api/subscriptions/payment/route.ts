// ============================================================
// /api/subscriptions/payment — Initiate Subscription Payment
// ============================================================
// POST — Creates a SubscriptionPayment record with status 'pending'.
//         Returns the payment ID for tracking. The payment will be
//         verified separately via /api/subscriptions/payment/verify.
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  created,
  error,
  notFound,
  getUserId,
} from '@/lib/api-utils'
import {
  computePrice,
  computeBillingPeriod,
  type BillingDuration,
  type PaymentMethod,
} from '@/lib/subscription'

// -----------------------------------------------------------
// POST /api/subscriptions/payment
// Body: { subscriptionId, tenantId, paymentMethod, paymentPhone?, amount, duration }
// -----------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request)
    const body = await request.json()

    // Validate required fields
    if (!body.subscriptionId) return error('subscriptionId is required')
    if (!body.tenantId) return error('tenantId is required')
    if (!['bkash', 'nagad', 'bank', 'manual'].includes(body.paymentMethod)) {
      return error('paymentMethod must be bkash, nagad, bank, or manual')
    }
    if (!body.amount || Number(body.amount) <= 0) {
      return error('amount must be a positive number')
    }
    if (![1, 6, 12].includes(body.duration)) {
      return error('duration must be 1, 6, or 12')
    }

    const subscriptionId = Number(body.subscriptionId)
    const tenantId = Number(body.tenantId)
    const paymentMethod = body.paymentMethod as PaymentMethod
    const paymentPhone = body.paymentPhone || null
    const amount = Number(body.amount)
    const duration = body.duration as BillingDuration

    // Verify subscription exists and belongs to this tenant
    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        tenantId,
        status: { notIn: ['cancelled', 'terminated'] },
      },
      include: { plan: true },
    })

    if (!subscription) {
      return notFound('Active subscription')
    }

    // Compute billing period from current date
    const now = new Date()
    const billingPeriod = computeBillingPeriod(now, duration)

    // Validate amount against computed price (allow small floating-point tolerance)
    const expectedAmount = computePrice(
      Number(subscription.plan.priceMonthly),
      subscription.plan.price6Monthly ? Number(subscription.plan.price6Monthly) : null,
      subscription.plan.priceYearly ? Number(subscription.plan.priceYearly) : null,
      duration,
    )

    if (Math.abs(amount - expectedAmount) > 0.01) {
      return error(
        `Amount mismatch. Expected ${expectedAmount} BDT for ${duration} month(s) on "${subscription.plan.name}" plan, received ${amount} BDT.`
      )
    }

    // Create the payment record
    const payment = await db.subscriptionPayment.create({
      data: {
        subscriptionId,
        tenantId,
        amount,
        currency: 'BDT',
        paymentMethod,
        paymentPhone,
        status: 'pending',
        billingPeriod,
        duration,
      },
    })

    // Audit log
    await db.activityLog.create({
      data: {
        tenantId,
        userId,
        action: 'subscription.payment_initiated',
        entityType: 'subscription_payment',
        entityId: payment.id,
        description: `Payment of ${amount} BDT initiated via ${paymentMethod} for subscription #${subscriptionId}`,
        metadata: {
          subscriptionId,
          amount,
          currency: 'BDT',
          paymentMethod,
          paymentPhone,
          duration,
          billingPeriod,
        },
      },
    })

    return created(
      {
        paymentId: payment.id,
        status: payment.status,
        amount: Number(payment.amount),
        currency: payment.currency,
        billingPeriod: payment.billingPeriod,
      },
      'Payment initiated successfully'
    )
  } catch (e) {
    return error(String(e))
  }
}
