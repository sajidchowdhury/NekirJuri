// ============================================================
// Madrasha ERP SaaS — Subscription Utility Functions
// ============================================================
// Provides helpers for computing enforcement levels, end dates,
// billing periods, pricing, and tenant cache updates for the
// subscription system.
// ============================================================

// -----------------------------------------------------------
// ensureDate — Defensive Date wrapper
// -----------------------------------------------------------

/**
 * Ensure a value is a Date object.
 * Prisma DateTime fields arrive as Date on the server,
 * but after JSON serialization (API responses, JWT claims)
 * they become ISO 8601 strings. This wrapper safely converts
 * both to Date, preventing TypeError on .getTime() calls.
 */
function ensureDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

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
  gracePeriodDaysRemaining: number
  warnings: string[]
  features: string[]
  maxStudents: number
  maxEmployees: number
  maxStorageMb: number
  maxAlbums: number
  maxImagesPerAlbum: number
  maxImageSizeMb: number
}

/** Valid billing durations in months */
export type BillingDuration = 1 | 6 | 12

/** Valid payment methods */
export type PaymentMethod = 'bkash' | 'nagad' | 'bank' | 'manual'

/** Grace period duration in days */
export const GRACE_PERIOD_DAYS = 14

/** Data deletion delay after termination in days */
export const DATA_DELETION_DELAY_DAYS = 30

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
// computeCurrentPeriodEnd
// -----------------------------------------------------------

/**
 * Compute the currentPeriodEnd — the exact end of the current billing period.
 * For a new subscription, this equals endDate.
 * For a renewed subscription, this is the new billing period end.
 */
export function computeCurrentPeriodEnd(startDate: Date, duration: BillingDuration): Date {
  return computeEndDate(startDate, duration)
}

// -----------------------------------------------------------
// computeGracePeriodEnd
// -----------------------------------------------------------

/**
 * Compute when the grace period ends after subscription expiration.
 * Grace period = endDate + GRACE_PERIOD_DAYS (14 days by default).
 */
export function computeGracePeriodEnd(endDate: Date): Date {
  const graceEnd = new Date(endDate)
  graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS)
  return graceEnd
}

// -----------------------------------------------------------
// computeDataDeletionDate
// -----------------------------------------------------------

/**
 * Compute when business data should be deleted after termination.
 * dataDeletionDate = terminatedAt + DATA_DELETION_DELAY_DAYS (30 days).
 */
export function computeDataDeletionDate(terminatedAt: Date): Date {
  const deletionDate = new Date(terminatedAt)
  deletionDate.setDate(deletionDate.getDate() + DATA_DELETION_DELAY_DAYS)
  return deletionDate
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
 * Uses new CR-7 schema fields:
 *   - currentPeriodEnd: Exact end of current billing period
 *   - gracePeriodEnd: When grace period ends (endDate + 14 days)
 *   - restrictedEnd: When restricted period ends before suspension
 *
 * Fallback: If new fields are null/missing (legacy data), computes
 * them from endDate + GRACE_PERIOD_DAYS.
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
  startDate: Date | string
  endDate: Date | string
  currentPeriodEnd?: Date | string | null
  gracePeriodEnd?: Date | string | null
  restrictedEnd?: Date | string | null
  trialEnd?: Date | string | null
  now?: Date
  features?: string[]
  maxStudents?: number
  maxEmployees?: number
  maxStorageMb?: number
  maxAlbums?: number
  maxImagesPerAlbum?: number
  maxImageSizeMb?: number
}): EnforcementResult {
  const now = params.now ?? new Date()
  const status = params.status

  // Defensive: ensure Date objects (Prisma returns Date, but JSON-serialized = string)
  const startDate = ensureDate(params.startDate) ?? new Date()
  const endDate = ensureDate(params.endDate) ?? new Date()

  // Use new schema fields with fallback to computed values
  const currentPeriodEnd = ensureDate(params.currentPeriodEnd) ?? endDate
  const gracePeriodEnd = ensureDate(params.gracePeriodEnd) ?? computeGracePeriodEnd(endDate)
  const trialEnd = ensureDate(params.trialEnd) ?? null

  const msPerDay = 86_400_000
  const daysRemaining = Math.max(0, Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / msPerDay))
  const trialDaysRemaining = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / msPerDay))
    : 0
  const gracePeriodDaysRemaining = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / msPerDay))

  const isExpired = now > currentPeriodEnd
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
      if (gracePeriodDaysRemaining > 0) {
        warnings.push(`Your subscription is in grace period (${gracePeriodDaysRemaining} day(s) remaining). You can view data but cannot make changes. Please renew.`)
      } else {
        warnings.push('Grace period has ended. Your subscription will be restricted soon. Please renew immediately.')
      }
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
    gracePeriodDaysRemaining,
    warnings,
    features: params.features ?? [],
    maxStudents: params.maxStudents ?? 0,
    maxEmployees: params.maxEmployees ?? 0,
    maxStorageMb: params.maxStorageMb ?? 0,
    maxAlbums: params.maxAlbums ?? 5,
    maxImagesPerAlbum: params.maxImagesPerAlbum ?? 20,
    maxImageSizeMb: params.maxImageSizeMb ?? 2,
  }
}

// -----------------------------------------------------------
// computeTenantCache
// -----------------------------------------------------------

/**
 * Compute the cached tenant-level fields from subscription data.
 * These are stored on the Tenant model for quick checks without
 * joining to the Subscription table.
 *
 * Returns:
 *   - subscriptionStatus: The current subscription status string
 *   - isReadOnly: Whether the tenant should be blocked from writes
 */
export function computeTenantCache(enforcement: EnforcementResult): {
  subscriptionStatus: SubscriptionStatus
  isReadOnly: boolean
} {
  return {
    subscriptionStatus: enforcement.status,
    isReadOnly: enforcement.level !== 'full',
  }
}
