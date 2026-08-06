// ============================================================
// Fee Categories [id] API — PATCH (update), DELETE (soft delete)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  requireTenantId,
  getUserId,
} from '@/lib/api-utils'

// --- PATCH: Update fee category ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const feeCategoryId = Number(id)

    if (isNaN(feeCategoryId)) {
      return error('Invalid fee category ID')
    }

    // Check existence
    const existing = await db.feeCategory.findFirst({
      where: { id: feeCategoryId, tenantId: tid },
    })
    if (!existing) return notFound('Fee category')

    const body = await request.json()
    const { name, code, description, amount, isRecurring, frequency, isActive } = body

    // If code is being changed, check uniqueness
    if (code && code !== existing.code) {
      const duplicate = await db.feeCategory.findFirst({
        where: { tenantId: tid, code },
      })
      if (duplicate) return error('Fee category code already exists')
    }

    const record = await db.feeCategory.update({
      where: { id: feeCategoryId },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(description !== undefined && { description: description || null }),
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(frequency !== undefined && { frequency }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'UPDATE',
        entityType: 'FeeCategory',
        entityId: record.id,
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(record),
      },
    })

    return success(record, 'Fee category updated successfully')
  } catch (err) {
    console.error('[fee-categories][id][PATCH]', err)
    return error('Failed to update fee category', 500)
  }
}

// --- DELETE: Soft delete (set isActive = false) ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const feeCategoryId = Number(id)

    if (isNaN(feeCategoryId)) {
      return error('Invalid fee category ID')
    }

    // Check existence
    const existing = await db.feeCategory.findFirst({
      where: { id: feeCategoryId, tenantId: tid },
    })
    if (!existing) return notFound('Fee category')

    // Soft delete — mark as inactive
    const record = await db.feeCategory.update({
      where: { id: feeCategoryId },
      data: { isActive: false },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'DELETE',
        entityType: 'FeeCategory',
        entityId: record.id,
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(record),
      },
    })

    return success(record, 'Fee category deleted successfully')
  } catch (err) {
    console.error('[fee-categories][id][DELETE]', err)
    return error('Failed to delete fee category', 500)
  }
}
