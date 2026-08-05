// ============================================================
// Fee Discounts API — GET (list), POST (create discount/waiver)
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

// --- GET: List fee discounts with pagination & filters ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const invoiceId = url.searchParams.get('invoiceId')
    const status = url.searchParams.get('status')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (studentId) where.studentId = Number(studentId)
    if (invoiceId) where.invoiceId = Number(invoiceId)
    if (status) where.status = status

    if (search) {
      where.OR = [
        { reason: { contains: search } },
        { student: { name: { contains: search } } },
      ]
    }

    const [data, total] = await Promise.all([
      db.feeDiscount.findMany({
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
            select: { id: true, invoiceNo: true },
          },
          feeCategory: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      db.feeDiscount.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[fee-discounts][GET]', err)
    return error('Failed to fetch fee discounts', 500)
  }
}

// --- POST: Create fee discount / waiver ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()
    const {
      studentId,
      invoiceId,
      feeCategoryId,
      discountType,
      discountValue,
      reason,
      approvedBy,
      status,
    } = body

    if (!studentId || !discountType || discountValue === undefined) {
      return error('studentId, discountType, and discountValue are required')
    }

    if (Number(discountValue) <= 0) {
      return error('discountValue must be positive')
    }

    // Validate valid discount types
    const validTypes = ['percentage', 'flat', 'waiver']
    if (!validTypes.includes(discountType)) {
      return error(`discountType must be one of: ${validTypes.join(', ')}`)
    }

    // If percentage, validate range
    if (discountType === 'percentage' && Number(discountValue) > 100) {
      return error('Percentage discount cannot exceed 100%')
    }

    const record = await db.feeDiscount.create({
      data: {
        tenantId: tid,
        studentId: Number(studentId),
        invoiceId: invoiceId ? Number(invoiceId) : null,
        feeCategoryId: feeCategoryId ? Number(feeCategoryId) : null,
        discountType,
        discountValue: Number(discountValue),
        reason: reason || null,
        approvedBy: approvedBy ? Number(approvedBy) : null,
        status: status || 'pending',
        createdBy: userId,
      },
      include: {
        student: {
          select: { id: true, name: true, registrationNo: true },
        },
        invoice: {
          select: { id: true, invoiceNo: true },
        },
        feeCategory: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'FeeDiscount',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[fee-discounts][POST]', err)
    return error('Failed to create fee discount', 500)
  }
}
