// ============================================================
// Backup & Restore — Model Registry
// Module 28: Backup & Restore
// Defines which models to export/import and in what order
// ============================================================

import { db } from '@/lib/db'
import type { PartialScope } from './constants'

/**
 * Model definitions for backup export/import.
 * Order matters: forward = insert order (respect FK deps),
 * reverse = delete order (avoid FK violations).
 */
export interface BackupModelDef {
  /** Prisma model key (camelCase, matches db.xxx) */
  key: string
  /** Human-readable label */
  label: string
  /** Partial scopes this model belongs to */
  scopes: PartialScope[]
  /** Whether this model has tenantId */
  hasTenantId: boolean
}

/**
 * All tenant-scoped models in dependency order (forward = insert order).
 * SaaS-level models (Tenant, Subscription, SubscriptionPlan, SubscriptionPayment, Permission)
 * are EXCLUDED — they're not tenant business data.
 */
export const BACKUP_MODELS: BackupModelDef[] = [
  // Security (tenant-scoped roles & user-role assignments)
  { key: 'role', label: 'Roles', scopes: [], hasTenantId: true },

  // Academic
  { key: 'academicSession', label: 'Academic Sessions', scopes: ['academic'], hasTenantId: true },
  { key: 'class', label: 'Classes', scopes: ['academic'], hasTenantId: true },
  { key: 'section', label: 'Sections', scopes: ['academic'], hasTenantId: true },
  { key: 'student', label: 'Students', scopes: ['academic'], hasTenantId: true },
  { key: 'guardian', label: 'Guardians', scopes: ['academic'], hasTenantId: true },
  { key: 'studentGuardian', label: 'Student-Guardian Links', scopes: ['academic'], hasTenantId: false },
  { key: 'teacher', label: 'Teachers', scopes: ['academic'], hasTenantId: true },
  { key: 'employee', label: 'Employees', scopes: ['hr'], hasTenantId: true },
  { key: 'studentPromotion', label: 'Student Promotions', scopes: ['academic'], hasTenantId: true },

  // Finance
  { key: 'feeCategory', label: 'Fee Categories', scopes: ['finance'], hasTenantId: true },
  { key: 'feeStructure', label: 'Fee Structures', scopes: ['finance'], hasTenantId: true },
  { key: 'feeInvoice', label: 'Fee Invoices', scopes: ['finance'], hasTenantId: true },
  { key: 'feeInvoiceItem', label: 'Fee Invoice Items', scopes: ['finance'], hasTenantId: false },
  { key: 'feeCollection', label: 'Fee Collections', scopes: ['finance'], hasTenantId: true },
  { key: 'feeDiscount', label: 'Fee Discounts', scopes: ['finance'], hasTenantId: true },
  { key: 'donationCategory', label: 'Donation Categories', scopes: ['finance'], hasTenantId: true },
  { key: 'donor', label: 'Donors', scopes: ['finance'], hasTenantId: true },
  { key: 'donation', label: 'Donations', scopes: ['finance'], hasTenantId: true },
  { key: 'expenseCategory', label: 'Expense Categories', scopes: ['finance'], hasTenantId: true },
  { key: 'expense', label: 'Expenses', scopes: ['finance'], hasTenantId: true },

  // HR / Payroll
  { key: 'salaryStructure', label: 'Salary Structures', scopes: ['hr'], hasTenantId: true },
  { key: 'salaryPayment', label: 'Salary Payments', scopes: ['hr'], hasTenantId: true },

  // Inventory
  { key: 'supplier', label: 'Suppliers', scopes: ['inventory'], hasTenantId: true },
  { key: 'productCategory', label: 'Product Categories', scopes: ['inventory'], hasTenantId: true },
  { key: 'product', label: 'Products', scopes: ['inventory'], hasTenantId: true },
  { key: 'purchase', label: 'Purchases', scopes: ['inventory'], hasTenantId: true },
  { key: 'purchaseItem', label: 'Purchase Items', scopes: ['inventory'], hasTenantId: false },
  { key: 'stockMovement', label: 'Stock Movements', scopes: ['inventory'], hasTenantId: true },
  { key: 'salesInvoice', label: 'Sales Invoices', scopes: ['inventory'], hasTenantId: true },
  { key: 'salesItem', label: 'Sales Items', scopes: ['inventory'], hasTenantId: false },

  // Accounting
  { key: 'chartOfAccount', label: 'Chart of Accounts', scopes: ['accounting'], hasTenantId: true },
  { key: 'journalEntry', label: 'Journal Entries', scopes: ['accounting'], hasTenantId: true },
  { key: 'journalEntryItem', label: 'Journal Entry Items', scopes: ['accounting'], hasTenantId: false },

  // Website / CMS
  { key: 'websitePage', label: 'Website Pages', scopes: ['website'], hasTenantId: true },
  { key: 'notice', label: 'Notices', scopes: ['website'], hasTenantId: true },
  { key: 'gallery', label: 'Galleries', scopes: ['website'], hasTenantId: true },
  { key: 'galleryImage', label: 'Gallery Images', scopes: ['website'], hasTenantId: false },

  // System
  { key: 'settings', label: 'Settings', scopes: [], hasTenantId: true },
  { key: 'notification', label: 'Notifications', scopes: [], hasTenantId: true },

  // Security (role assignments)
  { key: 'rolePermission', label: 'Role Permissions', scopes: [], hasTenantId: false },
  { key: 'userRole', label: 'User Roles', scopes: [], hasTenantId: true },
]

/**
 * Get models filtered by partial scope(s).
 * If no scopes provided, returns all models (full backup).
 */
export function getModelsForScopes(scopes: PartialScope[]): BackupModelDef[] {
  if (scopes.length === 0) return BACKUP_MODELS
  return BACKUP_MODELS.filter(
    (m) => m.scopes.length === 0 || m.scopes.some((s) => scopes.includes(s))
  )
}

/**
 * Get reverse-ordered models for deletion (avoids FK violations).
 */
export function getModelsInReverseOrder(models: BackupModelDef[]): BackupModelDef[] {
  return [...models].reverse()
}

/**
 * Dynamic Prisma model accessor — type-safe-ish way to access db[model]
 */
 
export function getPrismaModel(modelKey: string): any {
  return (db as Record<string, unknown>)[modelKey]
}
