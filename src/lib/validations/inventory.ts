// ============================================================
// Zod Validation Schemas — Inventory Domain Entities
// Supplier, ProductCategory, Product, Purchase,
// StockMovement, SalesInvoice
// ============================================================

import { z } from 'zod'

// ── Supplier ───────────────────────────────────────────────

export const supplierCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  contactPerson: z.string().max(200).optional().nullable(),
  nidNo: z.string().max(30).optional().nullable(),
  bankAccount: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const supplierUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().max(50).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.string().max(0).optional().nullable()),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  contactPerson: z.string().max(200).optional().nullable(),
  nidNo: z.string().max(30).optional().nullable(),
  bankAccount: z.string().max(50).optional().nullable(),
  isActive: z.boolean().optional(),
})

// ── ProductCategory ────────────────────────────────────────

export const productCategoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  parentId: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  nameBn: z.string().max(200).optional().nullable(),
})

// ── Product ────────────────────────────────────────────────

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  categoryId: z.number().int().positive(),
  description: z.string().max(500).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  purchasePrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  salePrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  currentStock: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  minStockLevel: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  maxStockLevel: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  isActive: z.boolean().optional(),
  hasExpiry: z.boolean().optional(),
  nameBn: z.string().max(200).optional().nullable(),
})

export const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  code: z.string().min(1).max(50).optional(),
  categoryId: z.number().int().positive().optional(),
  description: z.string().max(500).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  purchasePrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  salePrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  currentStock: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  minStockLevel: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  maxStockLevel: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)).optional().nullable(),
  isActive: z.boolean().optional(),
  hasExpiry: z.boolean().optional(),
  nameBn: z.string().max(200).optional().nullable(),
})

// ── Purchase ───────────────────────────────────────────────

export const purchaseCreateSchema = z.object({
  purchaseNo: z.string().min(1).max(50),
  supplierId: z.number().int().positive(),
  purchaseDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  totalAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
  discountAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  taxAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  netAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque']).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
  status: z.enum(['pending', 'received', 'cancelled']).optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
    unitPrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
    totalPrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
    discountAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  })).optional(),
})

// ── StockMovement ──────────────────────────────────────────

export const stockMovementCreateSchema = z.object({
  productId: z.number().int().positive(),
  movementType: z.enum(['in', 'out', 'adjustment', 'transfer', 'return']),
  quantity: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)),
  referenceType: z.string().max(50).optional().nullable(),
  referenceId: z.number().int().positive().optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
  stockAfter: z.number().or(z.string().regex(/^-?\d+(\.\d+)?$/)),
})

// ── SalesInvoice ───────────────────────────────────────────

export const salesCreateSchema = z.object({
  invoiceNo: z.string().min(1).max(50),
  studentId: z.number().int().positive().optional().nullable(),
  customerName: z.string().max(200).optional().nullable(),
  saleDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  totalAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
  discountAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  netAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'bkash', 'nagad', 'cheque', 'online']),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid']).optional(),
  addToFee: z.boolean().optional(),
  remarks: z.string().max(500).optional().nullable(),
  status: z.enum(['pending', 'completed', 'cancelled', 'returned']).optional(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/)),
    unitPrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
    totalPrice: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)),
    discountAmount: z.number().nonnegative().or(z.string().regex(/^\d+(\.\d+)?$/)).optional(),
  })).optional(),
})

// ── Type Exports ──────────────────────────────────────────

export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>
export type SupplierUpdateInput = z.infer<typeof supplierUpdateSchema>
export type ProductCategoryCreateInput = z.infer<typeof productCategoryCreateSchema>
export type ProductCreateInput = z.infer<typeof productCreateSchema>
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>
export type PurchaseCreateInput = z.infer<typeof purchaseCreateSchema>
export type StockMovementCreateInput = z.infer<typeof stockMovementCreateSchema>
export type SalesCreateInput = z.infer<typeof salesCreateSchema>
