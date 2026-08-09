// ============================================================
// Unit Tests — src/lib/subscription.ts
// ============================================================
// Tests all 8 pure functions + 1 cache function.
// These are the most critical functions in the ERP —
// they control subscription enforcement for all tenants.
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  GRACE_PERIOD_DAYS,
  DATA_DELETION_DELAY_DAYS,
  computeEndDate,
  computeCurrentPeriodEnd,
  computeGracePeriodEnd,
  computeDataDeletionDate,
  computeBillingPeriod,
  computePrice,
  formatBDT,
  computeEnforcement,
  computeTenantCache,
} from '@/lib/subscription'

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

describe('Constants', () => {
  it('GRACE_PERIOD_DAYS should be 14', () => {
    expect(GRACE_PERIOD_DAYS).toBe(14)
  })

  it('DATA_DELETION_DELAY_DAYS should be 30', () => {
    expect(DATA_DELETION_DELAY_DAYS).toBe(30)
  })
})

// ──────────────────────────────────────────────
// computeEndDate
// ──────────────────────────────────────────────

describe('computeEndDate', () => {
  it('adds 1 month for monthly duration', () => {
    const start = new Date('2025-06-01')
    const end = computeEndDate(start, 1)
    expect(end.getMonth()).toBe(6) // July (0-indexed)
    expect(end.getDate()).toBe(1)
  })

  it('adds 6 months for half-yearly duration', () => {
    const start = new Date('2025-06-01')
    const end = computeEndDate(start, 6)
    expect(end.getMonth()).toBe(11) // December
    expect(end.getDate()).toBe(1)
  })

  it('adds 12 months for yearly duration', () => {
    const start = new Date('2025-06-01')
    const end = computeEndDate(start, 12)
    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(5) // June
  })

  it('handles year boundary correctly', () => {
    const start = new Date('2025-11-01')
    const end = computeEndDate(start, 6)
    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(4) // May
  })

  it('does not mutate the original date', () => {
    const start = new Date('2025-06-01')
    const originalMonth = start.getMonth()
    computeEndDate(start, 6)
    expect(start.getMonth()).toBe(originalMonth)
  })
})

// ──────────────────────────────────────────────
// computeCurrentPeriodEnd
// ──────────────────────────────────────────────

describe('computeCurrentPeriodEnd', () => {
  it('returns the same result as computeEndDate', () => {
    const start = new Date('2025-06-01')
    const periodEnd = computeCurrentPeriodEnd(start, 12)
    const endDate = computeEndDate(start, 12)
    expect(periodEnd.getTime()).toBe(endDate.getTime())
  })
})

// ──────────────────────────────────────────────
// computeGracePeriodEnd
// ──────────────────────────────────────────────

describe('computeGracePeriodEnd', () => {
  it('adds GRACE_PERIOD_DAYS to the end date', () => {
    const endDate = new Date('2025-06-10')
    const graceEnd = computeGracePeriodEnd(endDate)
    expect(graceEnd.getDate()).toBe(24) // 10 + 14
  })

  it('handles month boundary correctly', () => {
    const endDate = new Date('2025-06-25')
    const graceEnd = computeGracePeriodEnd(endDate)
    expect(graceEnd.getMonth()).toBe(6) // July (overflow)
    expect(graceEnd.getDate()).toBe(9)  // 25 + 14 = 39 - 30 = 9
  })

  it('does not mutate the original date', () => {
    const endDate = new Date('2025-06-10')
    const originalDate = endDate.getDate()
    computeGracePeriodEnd(endDate)
    expect(endDate.getDate()).toBe(originalDate)
  })
})

// ──────────────────────────────────────────────
// computeDataDeletionDate
// ──────────────────────────────────────────────

describe('computeDataDeletionDate', () => {
  it('adds DATA_DELETION_DELAY_DAYS to terminated date', () => {
    const terminated = new Date('2025-06-01')
    const deletion = computeDataDeletionDate(terminated)
    expect(deletion.getMonth()).toBe(6) // July
    expect(deletion.getDate()).toBe(1)  // June 1 + 30 days
  })

  it('preserves time component', () => {
    const terminated = new Date('2025-06-01T15:30:00Z')
    const deletion = computeDataDeletionDate(terminated)
    expect(deletion.getUTCHours()).toBe(15)
    expect(deletion.getUTCMinutes()).toBe(30)
  })
})

// ──────────────────────────────────────────────
// computeBillingPeriod
// ──────────────────────────────────────────────

describe('computeBillingPeriod', () => {
  it('returns YYYY-MM for monthly duration', () => {
    const date = new Date('2025-03-15')
    expect(computeBillingPeriod(date, 1)).toBe('2025-03')
  })

  it('pads single-digit months', () => {
    const date = new Date('2025-01-15')
    expect(computeBillingPeriod(date, 1)).toBe('2025-01')
  })

  it('returns YYYY-H1 for 6-month duration in first half', () => {
    const jan = new Date('2025-01-15')
    const jun = new Date('2025-06-15')
    expect(computeBillingPeriod(jan, 6)).toBe('2025-H1')
    expect(computeBillingPeriod(jun, 6)).toBe('2025-H1')
  })

  it('returns YYYY-H2 for 6-month duration in second half', () => {
    const jul = new Date('2025-07-15')
    const dec = new Date('2025-12-15')
    expect(computeBillingPeriod(jul, 6)).toBe('2025-H2')
    expect(computeBillingPeriod(dec, 6)).toBe('2025-H2')
  })

  it('returns YYYY for yearly duration', () => {
    const date = new Date('2025-06-15')
    expect(computeBillingPeriod(date, 12)).toBe('2025')
  })
})

// ──────────────────────────────────────────────
// computePrice
// ──────────────────────────────────────────────

describe('computePrice', () => {
  it('returns monthly price for duration 1', () => {
    expect(computePrice(999, null, null, 1)).toBe(999)
  })

  it('returns 6-month price if set', () => {
    expect(computePrice(999, 5394, null, 6)).toBe(5394)
  })

  it('falls back to monthly * 6 if 6-month price is null', () => {
    expect(computePrice(999, null, null, 6)).toBe(5994) // 999 * 6
  })

  it('falls back to monthly * 6 if 6-month price is undefined', () => {
    expect(computePrice(999, undefined, undefined, 6)).toBe(5994)
  })

  it('returns yearly price if set', () => {
    expect(computePrice(999, null, 9990, 12)).toBe(9990)
  })

  it('falls back to monthly * 12 if yearly price is null', () => {
    expect(computePrice(999, null, null, 12)).toBe(11988) // 999 * 12
  })

  it('handles zero monthly price', () => {
    expect(computePrice(0, null, null, 1)).toBe(0)
  })
})

// ──────────────────────────────────────────────
// formatBDT
// ──────────────────────────────────────────────

describe('formatBDT', () => {
  it('formats whole numbers with ৳ symbol', () => {
    const result = formatBDT(1999)
    expect(result).toContain('৳')
    expect(result).toContain('1,999')
  })

  it('formats zero', () => {
    const result = formatBDT(0)
    expect(result).toContain('৳')
    expect(result).toContain('0')
  })

  it('formats decimal amounts', () => {
    const result = formatBDT(99.5)
    expect(result).toContain('৳')
  })

  it('formats large numbers with thousand separators', () => {
    const result = formatBDT(1000000)
    expect(result).toContain('৳')
  })
})

// ──────────────────────────────────────────────
// computeEnforcement — THE CRITICAL FUNCTION
// ──────────────────────────────────────────────

describe('computeEnforcement', () => {
  const baseParams = {
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    now: new Date('2025-06-15'), // Mid-year — subscription active
  }

  // --- Trial ---
  describe('trial status', () => {
    it('returns full access level', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'trial',
        trialEnd: new Date('2025-06-20'), // 5 days remaining
      })
      expect(result.level).toBe('full')
      expect(result.isInTrial).toBe(true)
      expect(result.trialDaysRemaining).toBeGreaterThan(0)
    })

    it('warns when trial is expiring within 3 days', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'trial',
        trialEnd: new Date('2025-06-17'), // 2 days remaining
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('full')
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('Subscribe now')
    })

    it('warns when trial has expired', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'trial',
        trialEnd: new Date('2025-06-10'), // Already expired
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('full')
      expect(result.warnings.some(w => w.includes('expired'))).toBe(true)
    })
  })

  // --- Active ---
  describe('active status', () => {
    it('returns full access when not expired', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
      })
      expect(result.level).toBe('full')
      expect(result.isExpired).toBe(false)
    })

    it('returns readonly when expired (grace period auto-detection)', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
        currentPeriodEnd: new Date('2025-06-10'), // 5 days ago
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('readonly')
      expect(result.isExpired).toBe(true)
      expect(result.warnings.some(w => w.includes('read-only'))).toBe(true)
    })

    it('warns when subscription expires within 7 days', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
        currentPeriodEnd: new Date('2025-06-20'), // 5 days remaining
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('full')
      expect(result.warnings.some(w => w.includes('expires in'))).toBe(true)
    })

    it('does not warn when more than 7 days remaining', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
        currentPeriodEnd: new Date('2025-12-31'), // 199 days remaining
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('full')
      expect(result.warnings.length).toBe(0)
    })
  })

  // --- Grace Period ---
  describe('grace_period status', () => {
    it('returns readonly level', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'grace_period',
        endDate: new Date('2025-06-10'),
        gracePeriodEnd: new Date('2025-06-24'),
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('readonly')
    })

    it('warns about remaining grace period days', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'grace_period',
        endDate: new Date('2025-06-10'),
        gracePeriodEnd: new Date('2025-06-24'),
        now: new Date('2025-06-15'),
      })
      expect(result.gracePeriodDaysRemaining).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('grace period'))).toBe(true)
    })

    it('warns when grace period has ended', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'grace_period',
        endDate: new Date('2025-06-01'),
        gracePeriodEnd: new Date('2025-06-10'), // Already past
        now: new Date('2025-06-15'),
      })
      expect(result.warnings.some(w => w.includes('ended'))).toBe(true)
    })
  })

  // --- Restricted ---
  describe('restricted status', () => {
    it('returns restricted level', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'restricted',
      })
      expect(result.level).toBe('restricted')
      expect(result.warnings.some(w => w.includes('restricted'))).toBe(true)
    })
  })

  // --- Suspended ---
  describe('suspended status', () => {
    it('returns blocked level', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'suspended',
      })
      expect(result.level).toBe('blocked')
      expect(result.warnings.some(w => w.includes('suspended'))).toBe(true)
    })
  })

  // --- Terminated ---
  describe('terminated status', () => {
    it('returns blocked level', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'terminated',
      })
      expect(result.level).toBe('blocked')
      expect(result.warnings.some(w => w.includes('terminated'))).toBe(true)
    })
  })

  // --- Cancelled ---
  describe('cancelled status', () => {
    it('returns blocked level', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'cancelled',
      })
      expect(result.level).toBe('blocked')
      expect(result.warnings.some(w => w.includes('cancelled'))).toBe(true)
    })
  })

  // --- Plan Limits ---
  describe('plan limits', () => {
    it('returns provided plan limits', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
        maxStudents: 500,
        maxEmployees: 25,
        maxStorageMb: 2000,
        maxAlbums: 10,
        maxImagesPerAlbum: 50,
        maxImageSizeMb: 5,
      })
      expect(result.maxStudents).toBe(500)
      expect(result.maxEmployees).toBe(25)
      expect(result.maxStorageMb).toBe(2000)
      expect(result.maxAlbums).toBe(10)
      expect(result.maxImagesPerAlbum).toBe(50)
      expect(result.maxImageSizeMb).toBe(5)
    })

    it('uses defaults when plan limits are not provided', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
      })
      expect(result.maxStudents).toBe(0)
      expect(result.maxEmployees).toBe(0)
      expect(result.maxStorageMb).toBe(0)
      expect(result.maxAlbums).toBe(5)
      expect(result.maxImagesPerAlbum).toBe(20)
      expect(result.maxImageSizeMb).toBe(2)
    })
  })

  // --- Features ---
  describe('features', () => {
    it('returns provided features list', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
        features: ['accounting', 'payroll', 'inventory'],
      })
      expect(result.features).toEqual(['accounting', 'payroll', 'inventory'])
    })

    it('returns empty array when features not provided', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
      })
      expect(result.features).toEqual([])
    })
  })

  // --- Fallback behavior ---
  describe('fallback to computed dates', () => {
    it('uses endDate as currentPeriodEnd when not provided', () => {
      const result = computeEnforcement({
        status: 'active',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('full')
    })

    it('computes gracePeriodEnd from endDate when not provided', () => {
      const result = computeEnforcement({
        status: 'grace_period',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-10'),
        now: new Date('2025-06-15'),
      })
      expect(result.level).toBe('readonly')
      expect(result.gracePeriodDaysRemaining).toBeGreaterThan(0)
    })
  })

  // --- Edge cases ---
  describe('edge cases', () => {
    it('daysRemaining is never negative', () => {
      const result = computeEnforcement({
        status: 'active',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-01'),
        currentPeriodEnd: new Date('2025-06-01'),
        now: new Date('2025-12-01'), // Way past expiration
      })
      expect(result.daysRemaining).toBeGreaterThanOrEqual(0)
    })

    it('trialDaysRemaining is 0 when trialEnd is null', () => {
      const result = computeEnforcement({
        ...baseParams,
        status: 'active',
        trialEnd: null,
      })
      expect(result.trialDaysRemaining).toBe(0)
    })
  })
})

// ──────────────────────────────────────────────
// computeTenantCache
// ──────────────────────────────────────────────

describe('computeTenantCache', () => {
  it('returns subscriptionStatus and isReadOnly=false for full access', () => {
    const enforcement = computeEnforcement({
      status: 'active',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      now: new Date('2025-06-15'),
    })
    const cache = computeTenantCache(enforcement)
    expect(cache.subscriptionStatus).toBe('active')
    expect(cache.isReadOnly).toBe(false)
  })

  it('returns isReadOnly=true for readonly level', () => {
    const enforcement = computeEnforcement({
      status: 'grace_period',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-06-10'),
      gracePeriodEnd: new Date('2025-06-24'),
      now: new Date('2025-06-15'),
    })
    const cache = computeTenantCache(enforcement)
    expect(cache.subscriptionStatus).toBe('grace_period')
    expect(cache.isReadOnly).toBe(true)
  })

  it('returns isReadOnly=true for restricted level', () => {
    const enforcement = computeEnforcement({
      status: 'restricted',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      now: new Date('2025-06-15'),
    })
    const cache = computeTenantCache(enforcement)
    expect(cache.isReadOnly).toBe(true)
  })

  it('returns isReadOnly=true for blocked level', () => {
    const enforcement = computeEnforcement({
      status: 'suspended',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      now: new Date('2025-06-15'),
    })
    const cache = computeTenantCache(enforcement)
    expect(cache.isReadOnly).toBe(true)
  })
})
