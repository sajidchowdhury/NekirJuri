// ============================================================
// Zod Validation Schemas — Finance Domain Entities
// FeeCategory, FeeStructure, FeeInvoice, FeeCollection,
// FeeDiscount, DonationCategory, Donor, Donation,
// ExpenseCategory, Expense
// ============================================================

import { z } from 'zod'

// ── FeeCategory ────────────────────────────────────────────

export const feeCategoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  description: z.string().max(500).optional().nullable(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['monthly', 'quarterly', 'yearly', 'one_time']).optional().nullable(),
  isActive: z.boolean().optional(),
  nameBn: z.string().max(200).optional().nullable(),
})

export const feeCategoryUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  description: z.string().max(500).optional().nullable(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.enum(['monthly', 'quarterly', 'yearly', 'one_time']).optional().nullable(),
  isActive: z.boolean().optional(),
  nameBn: z.string().max(200).optional().nullable(),
})

// ── FeeStructure ───────────────────────────────────────────

export const feeStructureCreateSchema = z.object({
  classId: z.number().int().positive(),
  feeCategoryId: z.number().int().positive(),
  academicSessionId: z.number().int().positive(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  isMandatory: z.boolean().optional(),
})

// ── FeeInvoice ─────────────────────────────────────────────

export const feeInvoiceCreateSchema = z.object({
  invoiceNo: z.string().min(1).max(50),
  studentId: z.number().int().positive(),
  academicSessionId: z.number().int().positive(),
  classId: z.number().int().positive(),
  issueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  totalAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)),
  paidAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  discountAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  fineAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  balance: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)),
  status: z.enum(['unpaid', 'partial', 'paid', 'overdue', 'cancelled']).optional(),
  remarks: z.string().max(500).optional().nullable(),
  feeMonth: z.number().int().min(1).max(12).optional().nullable(),
  feeYear: z.number().int().min(2000).max(2100).optional().nullable(),
  invoiceItems: z.array(z.object({
    feeCategoryId: z.number().int().positive(),
    amount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)),
    discountAmount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
    netAmount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)),
    description: z.string().max(500).optional().nullable(),
  })).optional(),
})

export const feeInvoiceUpdateSchema = z.object({
  invoiceNo: z.string().min(1).max(50).optional(),
  studentId: z.number().int().positive().optional(),
  academicSessionId: z.number().int().positive().optional(),
  classId: z.number().int().positive().optional(),
  issueDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  totalAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  paidAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  discountAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  fineAmount: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  balance: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  status: z.enum(['unpaid', 'partial', 'paid', 'overdue', 'cancelled']).optional(),
  remarks: z.string().max(500).optional().nullable(),
  feeMonth: z.number().int().min(1).max(12).optional().nullable(),
  feeYear: z.number().int().min(2000).max(2100).optional().nullable(),
  invoiceItems: z.array(z.object({
    feeCategoryId: z.number().int().positive(),
    amount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)),
    discountAmount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
    netAmount: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)),
    description: z.string().max(500).optional().nullable(),
  })).optional(),
})

// ── FeeCollection ──────────────────────────────────────────

export const feeCollectionCreateSchema = z.object({
  receiptNo: z.string().min(1).max(50),
  invoiceId: z.number().int().positive(),
  studentId: z.number().int().positive(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque', 'online']),
  paymentDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  transactionRef: z.string().max(100).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  chequeNo: z.string().max(50).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
})

// ── FeeDiscount ────────────────────────────────────────────

export const feeDiscountCreateSchema = z.object({
  studentId: z.number().int().positive(),
  invoiceId: z.number().int().positive().optional().nullable(),
  feeCategoryId: z.number().int().positive().optional().nullable(),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  reason: z.string().max(500).optional().nullable(),
  approvedBy: z.number().int().positive().optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
})

// ── DonationCategory ───────────────────────────────────────

export const donationCategoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  nameBn: z.string().max(200).optional().nullable(),
})

// ── Donor ──────────────────────────────────────────────────

export const donorCreateSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  occupation: z.string().max(200).optional().nullable(),
  organization: z.string().max(200).optional().nullable(),
  nidNo: z.string().max(30).optional().nullable(),
  isRegular: z.boolean().optional(),
  totalPledged: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  reminderConsent: z.boolean().optional(),
  reminderMethod: z.enum(['email', 'sms', 'both']).optional(),
  remarks: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const donorUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  occupation: z.string().max(200).optional().nullable(),
  organization: z.string().max(200).optional().nullable(),
  nidNo: z.string().max(30).optional().nullable(),
  isRegular: z.boolean().optional(),
  totalPledged: z.number().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  reminderConsent: z.boolean().optional(),
  reminderMethod: z.enum(['email', 'sms', 'both']).optional(),
  remarks: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

// ── Donation ───────────────────────────────────────────────

export const donationCreateSchema = z.object({
  donationCategoryId: z.number().int().positive(),
  donorId: z.number().int().positive().optional().nullable(),
  receiptNo: z.string().min(1).max(50),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque', 'online']),
  paymentDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  transactionRef: z.string().max(100).optional().nullable(),
  isAnonymous: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['monthly', 'yearly']).optional().nullable(),
  recurringAmount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  nextDueDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  remarks: z.string().max(500).optional().nullable(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
})

export const donationUpdateSchema = z.object({
  donationCategoryId: z.number().int().positive().optional(),
  donorId: z.number().int().positive().optional().nullable(),
  receiptNo: z.string().min(1).max(50).optional(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque', 'online']).optional(),
  paymentDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  transactionRef: z.string().max(100).optional().nullable(),
  isAnonymous: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['monthly', 'yearly']).optional().nullable(),
  recurringAmount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  nextDueDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  remarks: z.string().max(500).optional().nullable(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
})

// ── ExpenseCategory ────────────────────────────────────────

export const expenseCategoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

// ── Expense ────────────────────────────────────────────────

export const expenseCreateSchema = z.object({
  voucherNo: z.string().min(1).max(50),
  expenseCategoryId: z.number().int().positive(),
  amount: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
  description: z.string().max(500).optional().nullable(),
  expenseDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque', 'online']),
  paidTo: z.string().max(200).optional().nullable(),
  receiptAttachment: z.string().max(500).optional().nullable(),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).optional(),
  approvedBy: z.number().int().positive().optional().nullable(),
})

// ── Type Exports ──────────────────────────────────────────

export type FeeCategoryCreateInput = z.infer<typeof feeCategoryCreateSchema>
export type FeeCategoryUpdateInput = z.infer<typeof feeCategoryUpdateSchema>
export type FeeStructureCreateInput = z.infer<typeof feeStructureCreateSchema>
export type FeeInvoiceCreateInput = z.infer<typeof feeInvoiceCreateSchema>
export type FeeInvoiceUpdateInput = z.infer<typeof feeInvoiceUpdateSchema>
export type FeeCollectionCreateInput = z.infer<typeof feeCollectionCreateSchema>
export type FeeDiscountCreateInput = z.infer<typeof feeDiscountCreateSchema>
export type DonationCategoryCreateInput = z.infer<typeof donationCategoryCreateSchema>
export type DonorCreateInput = z.infer<typeof donorCreateSchema>
export type DonorUpdateInput = z.infer<typeof donorUpdateSchema>
export type DonationCreateInput = z.infer<typeof donationCreateSchema>
export type DonationUpdateInput = z.infer<typeof donationUpdateSchema>
export type ExpenseCategoryCreateInput = z.infer<typeof expenseCategoryCreateSchema>
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>
