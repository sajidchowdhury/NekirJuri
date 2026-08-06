// ============================================================
// Fee Invoices API — GET (list with includes), POST (create with items in tx)
// Auto-generates invoice number: INV-{year}-{seq}
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

/** Generate the next invoice number for a tenant in a given year */
async function generateInvoiceNo(tenantId: number, year: number): Promise<string> {
  const prefix = `INV-${year}-`
  const last = await db.feeInvoice.findFirst({
    where: {
      tenantId,
      invoiceNo: { startsWith: prefix },
    },
    orderBy: { invoiceNo: 'desc' },
    select: { invoiceNo: true },
  })
  let seq = 1
  if (last) {
    const parts = last.invoiceNo.split('-')
    seq = (Number(parts[parts.length - 1]) || 0) + 1
  }
  return `${prefix}${String(seq).padStart(5, '0')}`
}

// --- GET: List fee invoices with pagination, filters, includes ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const status = url.searchParams.get('status')
    const classId = url.searchParams.get('classId')
    const academicSessionId = url.searchParams.get('academicSessionId')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      tenantId: tid,
      deletedAt: null,
    }
    if (studentId) where.studentId = Number(studentId)
    if (status) where.status = status
    if (classId) where.classId = Number(classId)
    if (academicSessionId) where.academicSessionId = Number(academicSessionId)

    if (search) {
      where.OR = [
        { invoiceNo: { contains: search } },
        { student: { name: { contains: search } } },
      ]
    }

    const [data, total] = await Promise.all([
      db.feeInvoice.findMany({
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
          class: { select: { id: true, name: true } },
          academicSession: { select: { id: true, name: true } },
          invoiceItems: {
            include: {
              feeCategory: { select: { id: true, name: true, code: true } },
              salesInvoice: {
                select: { id: true, invoiceNo: true, netAmount: true, saleDate: true },
              },
            },
          },
        },
      }),
      db.feeInvoice.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[fee-invoices][GET]', err)
    return error('Failed to fetch fee invoices', 500)
  }
}

// --- POST: Create invoice with items in a transaction ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()
    const {
      studentId,
      academicSessionId,
      classId,
      issueDate,
      dueDate,
      items,
      feeMonth,
      feeYear,
      remarks,
    } = body

    if (!studentId || !academicSessionId || !classId || !issueDate || !dueDate) {
      return error('studentId, academicSessionId, classId, issueDate, and dueDate are required')
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one invoice item is required')
    }

    // Validate items
    for (const item of items) {
      if (!item.feeCategoryId || item.amount === undefined || item.amount <= 0) {
        return error('Each item must have feeCategoryId and a positive amount')
      }
    }

    const year = new Date().getFullYear()
    const invoiceNo = await generateInvoiceNo(tid, year)

    // Calculate totals from items
    let totalAmount = 0
    const invoiceItems = items.map((item: { feeCategoryId: number; amount: number; discountAmount?: number; description?: string }) => {
      const discountAmt = Number(item.discountAmount || 0)
      const amt = Number(item.amount)
      const netAmt = amt - discountAmt
      totalAmount += netAmt
      return {
        tenantId: tid,
        feeCategoryId: Number(item.feeCategoryId),
        amount: amt,
        discountAmount: discountAmt,
        netAmount: netAmt,
        description: item.description || null,
      }
    })

    // Create invoice + items in a transaction
    const invoice = await db.$transaction(async (tx) => {
      const inv = await tx.feeInvoice.create({
        data: {
          tenantId: tid,
          invoiceNo,
          studentId: Number(studentId),
          academicSessionId: Number(academicSessionId),
          classId: Number(classId),
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
          totalAmount,
          paidAmount: 0,
          discountAmount: 0,
          fineAmount: 0,
          balance: totalAmount,
          status: 'unpaid',
          feeMonth: feeMonth ? Number(feeMonth) : null,
          feeYear: feeYear ? Number(feeYear) : null,
          remarks: remarks || null,
          createdBy: userId,
          invoiceItems: {
            create: invoiceItems,
          },
        },
        include: {
          student: {
            select: { id: true, name: true, registrationNo: true },
          },
          class: { select: { id: true, name: true } },
          academicSession: { select: { id: true, name: true } },
          invoiceItems: {
            include: {
              feeCategory: { select: { id: true, name: true, code: true } },
              salesInvoice: {
                select: { id: true, invoiceNo: true, netAmount: true, saleDate: true },
              },
            },
          },
        },
      })
      return inv
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'FeeInvoice',
        entityId: invoice.id,
        newValues: JSON.stringify(invoice),
      },
    })

    return created(invoice)
  } catch (err) {
    console.error('[fee-invoices][POST]', err)
    return error('Failed to create fee invoice', 500)
  }
}
