// ============================================================
// Zod Validation Schemas — System Domain Entities
// Tenant, User, Role, Notice, WebsitePage, Settings,
// SubscriptionPlan, Subscription, Gallery
// ============================================================
// Subscription Model (per business requirement):
//   FREE  — max 20 students, no paid features
//   PAID  — 300 BDT/month, all features, bKash/Nagad payment
// ============================================================

import { z } from 'zod'

// ── Shared Enums ──────────────────────────────────────────

const SubscriptionStatusEnum = z.enum([
  'trial', 'active', 'grace_period', 'restricted',
  'suspended', 'terminated', 'cancelled',
])
const BillingDurationEnum = z.enum(['1', '6', '12'])
const PaymentMethodEnum = z.enum(['bkash', 'nagad', 'bank', 'manual'])
const PaymentStatusEnum = z.enum(['pending', 'verified', 'failed', 'refunded'])
const AccountingModeEnum = z.enum(['simplified', 'double-entry'])
const NoticeTypeEnum = z.enum(['general', 'academic', 'financial', 'emergency', 'holiday', 'event'])
const TargetAudienceEnum = z.enum(['all', 'students', 'teachers', 'staff', 'guardians', 'admins'])

// ── Tenant ────────────────────────────────────────────────

export const tenantCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  domain: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  website: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isActive: z.boolean().optional(),
  accountingMode: AccountingModeEnum.optional(),
  settings: z.record(z.unknown()).optional().nullable(),
})

export const tenantUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  domain: z.string().max(200).optional().nullable(),
  logoUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  website: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isActive: z.boolean().optional(),
  accountingMode: AccountingModeEnum.optional(),
  settings: z.record(z.unknown()).optional().nullable(),
})

// ── User ──────────────────────────────────────────────────

export const userCreateSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(128),
  name: z.string().min(1).max(200),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isActive: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
})

export const userUpdateSchema = z.object({
  email: z.string().email().max(200).optional(),
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isActive: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
})

// ── Role ──────────────────────────────────────────────────

export const roleCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional().nullable(),
  isSystem: z.boolean().optional(),
  permissionIds: z.array(z.number().int().positive()).optional(),
})

export const roleUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  isSystem: z.boolean().optional(),
  permissionIds: z.array(z.number().int().positive()).optional(),
})

// ── Notice ────────────────────────────────────────────────

export const noticeCreateSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().max(50000).optional().nullable(),
  noticeType: NoticeTypeEnum,
  targetAudience: TargetAudienceEnum.optional().nullable(),
  attachmentUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isPublished: z.boolean().optional(),
})

export const noticeUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().max(50000).optional().nullable(),
  noticeType: NoticeTypeEnum.optional(),
  targetAudience: TargetAudienceEnum.optional().nullable(),
  attachmentUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isPublished: z.boolean().optional(),
})

// ── WebsitePage (CMS) ─────────────────────────────────────

export const websitePageCreateSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  content: z.string().max(500000).optional().nullable(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  featuredImageUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const websitePageUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().max(500000).optional().nullable(),
  metaTitle: z.string().max(200).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
  featuredImageUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

// ── Settings ──────────────────────────────────────────────

export const settingsUpsertSchema = z.object({
  settings: z.array(z.object({
    key: z.string().min(1).max(100),
    value: z.unknown().optional().nullable(),
  })).min(1, 'At least one setting is required'),
})

// ── SubscriptionPlan ──────────────────────────────────────
// Business model: FREE (20 students, 0 BDT) and PAID (300 BDT/month, all features)

export const subscriptionPlanCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(1000).optional().nullable(),
  priceMonthly: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
  price6Monthly: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  priceYearly: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  maxStudents: z.number().int().positive(),
  maxEmployees: z.number().int().positive(),
  maxStorageMb: z.number().int().positive(),
  maxAlbums: z.number().int().positive().optional(),
  maxImagesPerAlbum: z.number().int().positive().optional(),
  maxImageSizeMb: z.number().int().positive().optional(),
  features: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const subscriptionPlanUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(1000).optional().nullable(),
  priceMonthly: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  price6Monthly: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  priceYearly: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  maxStudents: z.number().int().positive().optional(),
  maxEmployees: z.number().int().positive().optional(),
  maxStorageMb: z.number().int().positive().optional(),
  maxAlbums: z.number().int().positive().optional(),
  maxImagesPerAlbum: z.number().int().positive().optional(),
  maxImageSizeMb: z.number().int().positive().optional(),
  features: z.record(z.unknown()).optional().nullable(),
  isActive: z.boolean().optional(),
})

// ── Subscription ──────────────────────────────────────────
// Payment through bKash/Nagad (per business requirement)

export const subscriptionCreateSchema = z.object({
  planId: z.number().int().positive(),
  billingDuration: z.number().int().min(1).max(12),
  paymentMethod: PaymentMethodEnum.optional().nullable(),
  isAutoRenew: z.boolean().optional(),
})

export const subscriptionPaymentSchema = z.object({
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  paymentMethod: PaymentMethodEnum,
  paymentRef: z.string().max(100).optional().nullable(),
  paymentPhone: z.string().max(20).optional().nullable(),
  billingPeriod: z.string().min(1).max(20),
  duration: z.number().int().min(1).max(12),
  notes: z.string().max(500).optional().nullable(),
})

// ── Gallery ───────────────────────────────────────────────

const galleryImageSchema = z.object({
  imageUrl: z.string().min(1).max(500),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
})

export const galleryCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  coverImageUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isPublished: z.boolean().optional(),
  images: z.array(galleryImageSchema).optional(),
})

export const galleryUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  coverImageUrl: z.string().url().max(500).optional().nullable().or(z.string().max(0).optional().nullable()),
  isPublished: z.boolean().optional(),
})

// ── Subscription Plan Constants (Business Requirement) ────

/** FREE plan: 20 students max, no paid features */
export const FREE_PLAN = {
  name: 'Free',
  slug: 'free',
  priceMonthly: 0,
  maxStudents: 20,
  maxEmployees: 5,
  maxStorageMb: 50,
  maxAlbums: 2,
  maxImagesPerAlbum: 10,
  maxImageSizeMb: 1,
  features: {
    students: true,
    teachers: true,
    classes: true,
    fees: true,
    donations: false,
    accounting: false,
    inventory: false,
    payroll: false,
    sms: false,
    customDomain: false,
  },
} as const

/** PAID plan: 300 BDT/month, all features, bKash/Nagad payment */
export const PAID_PLAN = {
  name: 'Paid',
  slug: 'paid',
  priceMonthly: 300, // 300 Taka per month
  maxStudents: 9999,
  maxEmployees: 9999,
  maxStorageMb: 5000,
  maxAlbums: 50,
  maxImagesPerAlbum: 100,
  maxImageSizeMb: 5,
  features: {
    students: true,
    teachers: true,
    classes: true,
    fees: true,
    donations: true,
    accounting: true,
    inventory: true,
    payroll: true,
    sms: true,
    customDomain: true,
  },
} as const

/** Accepted payment methods for subscription (bKash & Nagad per business requirement) */
export const SUBSCRIPTION_PAYMENT_METHODS = ['bkash', 'nagad'] as const

// ── Type Exports ──────────────────────────────────────────

export type TenantCreateInput = z.infer<typeof tenantCreateSchema>
export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type RoleCreateInput = z.infer<typeof roleCreateSchema>
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>
export type NoticeCreateInput = z.infer<typeof noticeCreateSchema>
export type NoticeUpdateInput = z.infer<typeof noticeUpdateSchema>
export type WebsitePageCreateInput = z.infer<typeof websitePageCreateSchema>
export type WebsitePageUpdateInput = z.infer<typeof websitePageUpdateSchema>
export type SettingsUpsertInput = z.infer<typeof settingsUpsertSchema>
export type SubscriptionPlanCreateInput = z.infer<typeof subscriptionPlanCreateSchema>
export type SubscriptionPlanUpdateInput = z.infer<typeof subscriptionPlanUpdateSchema>
export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>
export type SubscriptionPaymentInput = z.infer<typeof subscriptionPaymentSchema>
export type GalleryCreateInput = z.infer<typeof galleryCreateSchema>
export type GalleryUpdateInput = z.infer<typeof galleryUpdateSchema>
