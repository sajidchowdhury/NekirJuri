// ============================================================
// Expenses API — GET (list with filters), POST (create with voucher)
// Auto-generate voucher number: EXP-{year}-{seq}
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  created,
  error,
  paginated,
  getPaginationParams,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'

/** Generate the next expense voucher number: EXP-{year}-{seq} */
async function generateVoucherNo(tenantId: number, year: number): Promise<string> {
  const prefix = `EXP-${year}-`
  const last = await db.expense.findFirst({
    where: {
      tenantId,
      voucherNo: { startsWith: prefix },
    },
    orderBy: { voucherNo: 'desc' },
    select: { voucherNo: true },
  })
  let seq = 1
  if (last) {
    const parts = last.voucherNo.split('-')
    seq = (Number(parts[parts.length - 1]) || 0) + 1
  }
  return `${prefix}${String(seq).padStart(5, '0')}`
}

// --- GET: List expenses with pagination, filters, date range ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const expenseCategoryId = url.searchParams.get('categoryId')
    const status = url.searchParams.get('status')
    const paymentMethod = url.searchParams.get('paymentMethod')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (expenseCategoryId) where.expenseCategoryId = Number(expenseCategoryId)
    if (status) where.status = status
    if (paymentMethod) where.paymentMethod = paymentMethod

    // Date range filter
    if (dateFrom || dateTo) {
      where.expenseDate = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      }
    }

    if (search) {
      where.OR = [
        { voucherNo: { contains: search } },
        { description: { contains: search } },
        { paidTo: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          expenseCategory: { select: { id: true, name: true, code: true } },
        },
      }),
      db.expense.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[expenses][GET]', err)
    return error('Failed to fetch expenses', 500)
  }
}

// --- POST: Create expense with auto-generated voucher ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()
    const {
      expenseCategoryId,
      amount,
      description,
      expenseDate,
      paymentMethod,
      paidTo,
      receiptAttachment,
      status,
      approvedBy,
    } = body

    if (!expenseCategoryId || !amount || !expenseDate || !paymentMethod) {
      return error('expenseCategoryId, amount, expenseDate, and paymentMethod are required')
    }

    if (Number(amount) <= 0) {
      return error('Amount must be positive')
    }

    // Verify expense category belongs to tenant
    const category = await db.expenseCategory.findFirst({
      where: { id: Number(expenseCategoryId), tenantId: tid },
    })
    if (!category) return error('Expense category not found')

    const year = new Date().getFullYear()
    const voucherNo = await generateVoucherNo(tid, year)

    const record = await db.expense.create({
      data: {
        tenantId: tid,
        voucherNo,
        expenseCategoryId: Number(expenseCategoryId),
        amount: Number(amount),
        description: description || null,
        expenseDate: new Date(expenseDate),
        paymentMethod,
        paidTo: paidTo || null,
        receiptAttachment: receiptAttachment || null,
        status: status || 'pending',
        approvedBy: approvedBy ? Number(approvedBy) : null,
        createdBy: userId,
      },
      include: {
        expenseCategory: { select: { id: true, name: true, code: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'Expense',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[expenses][POST]', err)
    return error('Failed to create expense', 500)
  }
}
