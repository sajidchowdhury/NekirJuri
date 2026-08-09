// ============================================================
// Zod Validation Schemas — Accounting Domain Entities
// ChartOfAccount, JournalEntry, SalaryStructure, SalaryPayment
// ============================================================

import { z } from 'zod'

// ── Shared Enums ──────────────────────────────────────────

const AccountTypeEnum = z.enum(['asset', 'liability', 'equity', 'income', 'expense'])
const EmployeeTypeEnum = z.enum(['teacher', 'staff'])
const JournalStatusEnum = z.enum(['draft', 'posted', 'cancelled'])
const SalaryPaymentStatusEnum = z.enum(['paid', 'pending', 'failed'])
const PaymentMethodEnum = z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque', 'online'])

// ── ChartOfAccount ────────────────────────────────────────

export const accountCreateSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  accountType: AccountTypeEnum,
  parentId: z.number().int().positive().optional().nullable(),
  openingBalance: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  description: z.string().max(500).optional().nullable(),
})

export const accountUpdateSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  accountType: AccountTypeEnum.optional(),
  parentId: z.number().int().positive().optional().nullable(),
  openingBalance: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  currentBalance: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)).optional(),
  description: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

// ── JournalEntry ──────────────────────────────────────────

const journalEntryItemSchema = z.object({
  accountId: z.number().int().positive(),
  debit: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  credit: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  narration: z.string().max(500).optional().nullable(),
})

export const journalEntryCreateSchema = z.object({
  entryNo: z.string().min(1).max(50),
  entryDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  narration: z.string().max(1000).optional().nullable(),
  referenceType: z.string().max(50).optional().nullable(),
  referenceId: z.number().int().positive().optional().nullable(),
  status: JournalStatusEnum.optional(),
  items: z.array(journalEntryItemSchema).min(1, 'At least one journal entry item is required'),
})

export const journalEntryUpdateSchema = z.object({
  entryNo: z.string().min(1).max(50).optional(),
  entryDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  narration: z.string().max(1000).optional().nullable(),
  referenceType: z.string().max(50).optional().nullable(),
  referenceId: z.number().int().positive().optional().nullable(),
  status: JournalStatusEnum.optional(),
  items: z.array(journalEntryItemSchema).min(1).optional(),
})

// ── SalaryStructure ───────────────────────────────────────

export const salaryStructureCreateSchema = z.object({
  employeeType: EmployeeTypeEnum,
  teacherId: z.number().int().positive().optional().nullable(),
  employeeId: z.number().int().positive().optional().nullable(),
  basicSalary: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
  houseRent: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  medicalAllowance: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  transportAllowance: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  otherAllowance: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  pfDeduction: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  taxDeduction: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  otherDeduction: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  effectiveFrom: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  effectiveTo: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  isActive: z.boolean().optional(),
})

export const salaryStructureUpdateSchema = z.object({
  employeeType: EmployeeTypeEnum.optional(),
  teacherId: z.number().int().positive().optional().nullable(),
  employeeId: z.number().int().positive().optional().nullable(),
  basicSalary: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  houseRent: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  medicalAllowance: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  transportAllowance: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  otherAllowance: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  pfDeduction: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  taxDeduction: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  otherDeduction: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  effectiveFrom: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
  effectiveTo: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional().nullable()),
  isActive: z.boolean().optional(),
})

// ── SalaryPayment ─────────────────────────────────────────

export const salaryPaymentCreateSchema = z.object({
  employeeType: EmployeeTypeEnum,
  teacherId: z.number().int().positive().optional().nullable(),
  employeeId: z.number().int().positive().optional().nullable(),
  salaryStructureId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  paymentMethod: PaymentMethodEnum,
  paymentDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  transactionRef: z.string().max(100).optional().nullable(),
  status: SalaryPaymentStatusEnum.optional(),
  remarks: z.string().max(500).optional().nullable(),
})

// ── Type Exports ──────────────────────────────────────────

export type AccountCreateInput = z.infer<typeof accountCreateSchema>
export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>
export type JournalEntryCreateInput = z.infer<typeof journalEntryCreateSchema>
export type JournalEntryUpdateInput = z.infer<typeof journalEntryUpdateSchema>
export type SalaryStructureCreateInput = z.infer<typeof salaryStructureCreateSchema>
export type SalaryStructureUpdateInput = z.infer<typeof salaryStructureUpdateSchema>
export type SalaryPaymentCreateInput = z.infer<typeof salaryPaymentCreateSchema>
