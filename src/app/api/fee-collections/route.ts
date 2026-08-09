// ============================================================
// Fee Collections API — GET (list), POST (collect payment)
// On POST: auto-generate receipt (RCT-{year}-{seq}), update invoice
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
import { feeCollectionCreateSchema, formatZodError } from '@/lib/validations'

/** Generate the next receipt number: RCT-{year}-{seq} */
async function generateReceiptNo(tenantId: number, year: number): Promise<string> {
  const prefix = `RCT-${year}-`
  const last = await db.feeCollection.findFirst({
    where: {
      tenantId,
      receiptNo: { startsWith: prefix },
    },
    orderBy: { receiptNo: 'desc' },
    select: { receiptNo: true },
  })
  let seq = 1
  if (last) {
    const parts = last.receiptNo.split('-')
    seq = (Number(parts[parts.length - 1]) || 0) + 1
  }
  return `${prefix}${String(seq).padStart(5, '0')}`
}

// --- GET: List fee collections with pagination & filters ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const invoiceId = url.searchParams.get('invoiceId')
    const studentId = url.searchParams.get('studentId')
    const paymentMethod = url.searchParams.get('paymentMethod')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (invoiceId) where.invoiceId = Number(invoiceId)
    if (studentId) where.studentId = Number(studentId)
    if (paymentMethod) where.paymentMethod = paymentMethod

    if (search) {
      where.OR = [
        { receiptNo: { contains: search } },
        { student: { name: { contains: search } } },
      ]
    }

    const [data, total] = await Promise.all([
      db.feeCollection.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          student: {
            select: { id: true, name: true, registrationNo: true },
          },
          invoice: {
            select: { id: true, invoiceNo: true, status: true },
          },
        },
      }),
      db.feeCollection.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[fee-collections][GET]', err)
    return error('Failed to fetch fee collections', 500)
  }
}

// --- POST: Collect payment — create collection, update invoice ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = feeCollectionCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const {
      invoiceId,
      studentId,
      amount,
      paymentMethod,
      paymentDate,
      transactionRef,
      bankName,
      chequeNo,
      remarks,
    } = parsed.data

    // Verify invoice exists and belongs to tenant
    const invoice = await db.feeInvoice.findFirst({
      where: { id: Number(invoiceId), tenantId: tid, deletedAt: null },
    })
    if (!invoice) return error('Invoice not found')

    if (invoice.status === 'paid') {
      return error('Invoice is already fully paid')
    }

    // Validate payment doesn't exceed balance
    const paymentAmt = Number(amount)
    if (paymentAmt > invoice.balance) {
      return error(`Payment amount exceeds invoice balance of ${invoice.balance}`)
    }

    const year = new Date().getFullYear()
    const receiptNo = await generateReceiptNo(tid, year)

    // Use transaction to create collection + update invoice atomically
    const collection = await db.$transaction(async (tx) => {
      // Create the fee collection record
      const fc = await tx.feeCollection.create({
        data: {
          tenantId: tid,
          receiptNo,
          invoiceId: Number(invoiceId),
          studentId: Number(studentId),
          amount: paymentAmt,
          paymentMethod,
          paymentDate: new Date(paymentDate),
          transactionRef: transactionRef || null,
          bankName: bankName || null,
          chequeNo: chequeNo || null,
          remarks: remarks || null,
          status: 'completed',
          createdBy: userId,
        },
        include: {
          student: {
            select: { id: true, name: true, registrationNo: true },
          },
          invoice: {
            select: { id: true, invoiceNo: true, status: true },
          },
        },
      })

      // Update invoice: add to paidAmount, recalculate balance, update status
      const newPaidAmount = invoice.paidAmount + paymentAmt
      const newBalance = invoice.totalAmount + (invoice.fineAmount || 0) - (invoice.discountAmount || 0) - newPaidAmount
      const newStatus = newBalance <= 0.01 ? 'paid' : 'partial' // 0.01 tolerance for float

      await tx.feeInvoice.update({
        where: { id: Number(invoiceId) },
        data: {
          paidAmount: newPaidAmount,
          balance: Math.max(0, newBalance),
          status: newStatus,
          updatedBy: userId,
        },
      })

      return fc
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'FeeCollection',
        entityId: collection.id,
        newValues: JSON.stringify(collection),
      },
    })

    return created(collection, 'Payment collected successfully')
  } catch (err) {
    console.error('[fee-collections][POST]', err)
    return error('Failed to collect payment', 500)
  }
}
