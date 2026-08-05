// ============================================================
// Fee Invoice Detail API — GET (with items, collections, discounts), PUT (update)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'

// --- GET: Single invoice with full details ---
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { id } = await params
    const invoiceId = Number(id)

    const invoice = await db.feeInvoice.findFirst({
      where: { id: invoiceId, tenantId: tid, deletedAt: null },
      include: {
        student: {
          select: { id: true, name: true, registrationNo: true, phone: true },
        },
        class: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
        invoiceItems: {
          include: {
            feeCategory: { select: { id: true, name: true, code: true } },
          },
        },
        feeCollections: {
          orderBy: { paymentDate: 'desc' },
        },
        feeDiscounts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!invoice) return notFound('Fee invoice')

    return success(invoice)
  } catch (err) {
    console.error('[fee-invoices/[id]][GET]', err)
    return error('Failed to fetch fee invoice', 500)
  }
}

// --- PUT: Update invoice (status, remarks, etc.) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const { id } = await params
    const invoiceId = Number(id)

    const existing = await db.feeInvoice.findFirst({
      where: { id: invoiceId, tenantId: tid, deletedAt: null },
    })
    if (!existing) return notFound('Fee invoice')

    const body = await request.json()
    const { status, remarks, fineAmount, discountAmount } = body

    // Build update data
    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (status) updateData.status = status
    if (remarks !== undefined) updateData.remarks = remarks
    if (fineAmount !== undefined) {
      updateData.fineAmount = Number(fineAmount)
      // Recalculate balance if fine changed
      updateData.balance =
        existing.totalAmount +
        Number(fineAmount) -
        (existing.discountAmount || 0) -
        existing.paidAmount
    }
    if (discountAmount !== undefined) {
      updateData.discountAmount = Number(discountAmount)
      // Recalculate balance if discount changed
      updateData.balance =
        existing.totalAmount +
        (existing.fineAmount || 0) -
        Number(discountAmount) -
        existing.paidAmount
    }

    const invoice = await db.feeInvoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        student: { select: { id: true, name: true, registrationNo: true } },
        class: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
        invoiceItems: {
          include: {
            feeCategory: { select: { id: true, name: true, code: true } },
          },
        },
        feeCollections: { orderBy: { paymentDate: 'desc' } },
        feeDiscounts: { orderBy: { createdAt: 'desc' } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'UPDATE',
        entityType: 'FeeInvoice',
        entityId: invoiceId,
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(invoice),
      },
    })

    return success(invoice)
  } catch (err) {
    console.error('[fee-invoices/[id]][PUT]', err)
    return error('Failed to update fee invoice', 500)
  }
}
