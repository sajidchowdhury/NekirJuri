// ============================================================
// Test Fixtures — Reusable test data for all test suites
// ============================================================

import type { SubscriptionStatus } from '@/lib/subscription'

// ──────────────────────────────────────────────
// Dates (fixed for reproducibility)
// ──────────────────────────────────────────────

export const DATES = {
  // "Now" reference point: 2025-06-15T12:00:00Z
  now: new Date('2025-06-15T12:00:00Z'),
  // Subscription start: 2025-06-01
  startDate: new Date('2025-06-01T00:00:00Z'),
  // Monthly end: 2025-07-01
  monthlyEnd: new Date('2025-07-01T00:00:00Z'),
  // 6-month end: 2025-12-01
  sixMonthEnd: new Date('2025-12-01T00:00:00Z'),
  // Yearly end: 2026-06-01
  yearlyEnd: new Date('2026-06-01T00:00:00Z'),
  // Expired end: 2025-06-10 (5 days ago)
  expiredEnd: new Date('2025-06-10T00:00:00Z'),
  // Grace period end (expiredEnd + 14): 2025-06-24
  graceEnd: new Date('2025-06-24T00:00:00Z'),
  // Trial end: 2025-06-20
  trialEnd: new Date('2025-06-20T00:00:00Z'),
  // Far future: 2030-01-01
  farFuture: new Date('2030-01-01T00:00:00Z'),
} as const

// ──────────────────────────────────────────────
// Subscription Plans
// ──────────────────────────────────────────────

export const PLANS = {
  basic: {
    id: 1,
    name: 'Basic',
    slug: 'basic',
    priceMonthly: 999,
    price6Monthly: 5394,  // 999 * 6 - 600
    priceYearly: 9990,    // 999 * 12 - 1998
    maxStudents: 100,
    maxEmployees: 10,
    maxStorageMb: 500,
    maxAlbums: 5,
    maxImagesPerAlbum: 20,
    maxImageSizeMb: 2,
    isActive: true,
  },
  standard: {
    id: 2,
    name: 'Standard',
    slug: 'standard',
    priceMonthly: 1999,
    price6Monthly: null,  // Will fall back to monthly * 6
    priceYearly: null,    // Will fall back to monthly * 12
    maxStudents: 500,
    maxEmployees: 25,
    maxStorageMb: 2000,
    maxAlbums: 10,
    maxImagesPerAlbum: 50,
    maxImageSizeMb: 5,
    isActive: true,
  },
  premium: {
    id: 3,
    name: 'Premium',
    slug: 'premium',
    priceMonthly: 4999,
    price6Monthly: 27994,
    priceYearly: 49990,
    maxStudents: 2000,
    maxEmployees: 50,
    maxStorageMb: 10000,
    maxAlbums: 20,
    maxImagesPerAlbum: 100,
    maxImageSizeMb: 10,
    isActive: true,
  },
} as const

// ──────────────────────────────────────────────
// Tenants
// ──────────────────────────────────────────────

export const TENANTS = {
  active: {
    id: 1,
    name: 'Active Madrasha',
    slug: 'active-madrasha',
    isActive: true,
    accountingMode: 'double-entry',
    subscriptionStatus: 'active' as SubscriptionStatus,
    isReadOnly: false,
    storageUsedMb: 250,
  },
  trial: {
    id: 2,
    name: 'Trial Madrasha',
    slug: 'trial-madrasha',
    isActive: true,
    accountingMode: 'double-entry',
    subscriptionStatus: 'trial' as SubscriptionStatus,
    isReadOnly: false,
    storageUsedMb: 50,
  },
  expired: {
    id: 3,
    name: 'Expired Madrasha',
    slug: 'expired-madrasha',
    isActive: true,
    accountingMode: 'simplified',
    subscriptionStatus: 'grace_period' as SubscriptionStatus,
    isReadOnly: true,
    storageUsedMb: 100,
  },
} as const

// ──────────────────────────────────────────────
// Subscriptions
// ──────────────────────────────────────────────

export const SUBSCRIPTIONS = {
  active: {
    id: 1,
    tenantId: 1,
    planId: 2,
    status: 'active' as SubscriptionStatus,
    startDate: DATES.startDate,
    endDate: DATES.yearlyEnd,
    currentPeriodEnd: DATES.yearlyEnd,
    gracePeriodEnd: null,
    restrictedEnd: null,
    trialEnd: null,
    isAutoRenew: true,
    billingDuration: 12,
  },
  trial: {
    id: 2,
    tenantId: 2,
    planId: 1,
    status: 'trial' as SubscriptionStatus,
    startDate: DATES.startDate,
    endDate: DATES.trialEnd,
    currentPeriodEnd: DATES.trialEnd,
    gracePeriodEnd: null,
    restrictedEnd: null,
    trialEnd: DATES.trialEnd,
    isAutoRenew: false,
    billingDuration: 1,
  },
  gracePeriod: {
    id: 3,
    tenantId: 3,
    planId: 1,
    status: 'grace_period' as SubscriptionStatus,
    startDate: new Date('2025-05-01'),
    endDate: DATES.expiredEnd,
    currentPeriodEnd: DATES.expiredEnd,
    gracePeriodEnd: DATES.graceEnd,
    restrictedEnd: null,
    trialEnd: null,
    isAutoRenew: false,
    billingDuration: 1,
  },
} as const
