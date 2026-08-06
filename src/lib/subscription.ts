// ============================================================
// Madrasha ERP SaaS — Subscription Utility Functions
// ============================================================
// Provides helpers for computing enforcement levels, end dates,
// billing periods, and pricing for the subscription system.
// ============================================================

/** Subscription status values (mirrors schema) */
export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'grace_period'
  | 'restricted'
  | 'suspended'
  | 'terminated'
  | 'cancelled'

/** Enforcement levels — controls what the tenant can access */
export type EnforcementLevel = 'full' | 'readonly' | 'restricted' | 'blocked'

/** Enforcement result returned to callers */
export interface EnforcementResult {
  level: EnforcementLevel
  status: SubscriptionStatus
  isExpired: boolean
  isInTrial: boolean
  daysRemaining: number
  trialDaysRemaining: number
  warnings: string[]
  features: string[]
  maxStudents: number
  maxEmployees: number
  maxStorageMb: number
}

/** Valid billing durations in months */
export type BillingDuration = 1 | 6 | 12

/** Valid payment methods */
export type PaymentMethod = 'bkash' | 'nagad' | 'bank' | 'manual'

// -----------------------------------------------------------
// computeEndDate
// -----------------------------------------------------------

/**
 * Compute the subscription end date given a start date and duration.
 * Duration is in months: 1, 6, or 12.
 */
export function computeEndDate(startDate: Date, duration: BillingDuration): Date {
  const end = new Date(startDate)
  end.setMonth(end.getMonth() + duration)
  return end
}

// -----------------------------------------------------------
// computeBillingPeriod
// -----------------------------------------------------------

/**
 * Compute a billing period label from a start date and duration.
 * Examples: "2025-01" (1mo), "2025-H1" (6mo), "2025" (12mo)
 */
export function computeBillingPeriod(startDate: Date, duration: BillingDuration): string {
  const year = startDate.getFullYear()
  const month = startDate.getMonth() + 1 // 1-indexed

  if (duration === 1) {
    return `${year}-${String(month).padStart(2, '0')}`
  }

  if (duration === 6) {
    // First half (Jan–Jun) or second half (Jul–Dec)
    return month <= 6 ? `${year}-H1` : `${year}-H2`
  }

  // Full year
  return `${year}`
}

// -----------------------------------------------------------
// computePrice
// -----------------------------------------------------------

/**
 * Compute the total price for a subscription plan given its pricing
 * tiers and the chosen duration. Falls back to monthly × duration
 * if a specific tier price is not set.
 */
export function computePrice(
  priceMonthly: number,
  price6Monthly: number | null | undefined,
  priceYearly: number | null | undefined,
  duration: BillingDuration
): number {
  if (duration === 1) return priceMonthly
  if (duration === 6) return price6Monthly ?? priceMonthly * 6
  if (duration === 12) return priceYearly ?? priceMonthly * 12
  return priceMonthly * duration
}

// -----------------------------------------------------------
// formatBDT
// -----------------------------------------------------------

/**
 * Format a number as Bangladeshi Taka currency.
 * Example: formatBDT(1999) → "৳1,999"
 */
export function formatBDT(amount: number): string {
  return '৳' + amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// -----------------------------------------------------------
// computeEnforcement
// -----------------------------------------------------------

/**
 * Determine the enforcement level for a tenant based on their
 * subscription status, dates, and plan limits.
 *
 * Logic:
 *   - trial          → full access, with trial warning
 *   - active         → full access if not expired; otherwise grace_period
 *   - grace_period   → readonly (can view, not edit)
 *   - restricted     → restricted (limited features)
 *   - suspended      → blocked
 *   - terminated     → blocked
 *   - cancelled      → blocked
 */
export function computeEnforcement(params: {
  status: SubscriptionStatus
  startDate: Date
  endDate: Date
  trialEnd: Date | null
  now?: Date
  features?: string[]
  maxStudents?: number
  maxEmployees?: number
  maxStorageMb?: number
}): EnforcementResult {
  const now = params.now ?? new Date()
  const { status, startDate, endDate, trialEnd } = params

  const msPerDay = 86_400_000
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / msPerDay))
  const trialDaysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay))
    : 0

  const isExpired = now > endDate
  const isInTrial = status === 'trial'

  const warnings: string[] = []
  let level: EnforcementLevel = 'full'

  switch (status) {
    case 'trial':
      level = 'full'
      if (trialDaysRemaining <= 0) {
        warnings.push('Trial period has expired. Please subscribe to continue using all features.')
      } else if (trialDaysRemaining <= 3) {
        warnings.push(`Trial expires in ${trialDaysRemaining} day(s). Subscribe now to avoid interruption.`)
      } else {
        warnings.push(`You are in trial mode with ${trialDaysRemaining} day(s) remaining.`)
      }
      break

    case 'active':
      if (isExpired) {
        // Subscription end date passed but status not yet updated — grace period
        level = 'readonly'
        warnings.push('Subscription has expired. Your data is in read-only mode. Please renew to restore full access.')
      } else if (daysRemaining <= 7) {
        level = 'full'
        warnings.push(`Subscription expires in ${daysRemaining} day(s). Renew now to avoid service interruption.`)
      } else {
        level = 'full'
      }
      break

    case 'grace_period':
      level = 'readonly'
      warnings.push('Your subscription is in grace period. You can view data but cannot make changes. Please renew.')
      break

    case 'restricted':
      level = 'restricted'
      warnings.push('Your subscription is restricted. Some features are disabled. Please update your subscription.')
      break

    case 'suspended':
      level = 'blocked'
      warnings.push('Your subscription is suspended. Contact support for assistance.')
      break

    case 'terminated':
      level = 'blocked'
      warnings.push('Your subscription has been terminated. Contact support for assistance.')
      break

    case 'cancelled':
      level = 'blocked'
      warnings.push('Your subscription has been cancelled.')
      break

    default:
      level = 'blocked'
      warnings.push('Unknown subscription status. Contact support.')
  }

  return {
    level,
    status,
    isExpired,
    isInTrial,
    daysRemaining,
    trialDaysRemaining,
    warnings,
    features: params.features ?? [],
    maxStudents: params.maxStudents ?? 0,
    maxEmployees: params.maxEmployees ?? 0,
    maxStorageMb: params.maxStorageMb ?? 0,
  }
}
