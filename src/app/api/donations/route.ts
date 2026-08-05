// ============================================================
// Donations API — GET (list with filters), POST (create with receipt)
// Auto-generate receipt number: DON-{year}-{seq}
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

/** Generate the next donation receipt number: DON-{year}-{seq} */
async function generateDonationReceiptNo(tenantId: number, year: number): Promise<string> {
  const prefix = `DON-${year}-`
  const last = await db.donation.findFirst({
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

// --- GET: List donations with pagination, filters, date range ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const donationCategoryId = url.searchParams.get('categoryId')
    const donorId = url.searchParams.get('donorId')
    const status = url.searchParams.get('status')
    const paymentMethod = url.searchParams.get('paymentMethod')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (donationCategoryId) where.donationCategoryId = Number(donationCategoryId)
    if (donorId) where.donorId = Number(donorId)
    if (status) where.status = status
    if (paymentMethod) where.paymentMethod = paymentMethod

    // Date range filter
    if (dateFrom || dateTo) {
      where.paymentDate = {
        ...(dateFrom && { gte: new Date(dateFrom) }),
        ...(dateTo && { lte: new Date(dateTo) }),
      }
    }

    if (search) {
      where.OR = [
        { receiptNo: { contains: search } },
        { donor: { name: { contains: search } } },
        { remarks: { contains: search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          donationCategory: { select: { id: true, name: true } },
          donor: { select: { id: true, name: true, phone: true } },
        },
      }),
      db.donation.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[donations][GET]', err)
    return error('Failed to fetch donations', 500)
  }
}

// --- POST: Create donation with auto-generated receipt ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()
    const {
      donationCategoryId,
      donorId,
      amount,
      paymentMethod,
      paymentDate,
      transactionRef,
      isAnonymous,
      remarks,
      status,
    } = body

    if (!donationCategoryId || !amount || !paymentMethod || !paymentDate) {
      return error('donationCategoryId, amount, paymentMethod, and paymentDate are required')
    }

    if (Number(amount) <= 0) {
      return error('Amount must be positive')
    }

    // Verify donation category belongs to tenant
    const category = await db.donationCategory.findFirst({
      where: { id: Number(donationCategoryId), tenantId: tid },
    })
    if (!category) return error('Donation category not found')

    // If donorId provided, verify donor belongs to tenant
    if (donorId) {
      const donor = await db.donor.findFirst({
        where: { id: Number(donorId), tenantId: tid, deletedAt: null },
      })
      if (!donor) return error('Donor not found')
    }

    const year = new Date().getFullYear()
    const receiptNo = await generateDonationReceiptNo(tid, year)

    const record = await db.donation.create({
      data: {
        tenantId: tid,
        donationCategoryId: Number(donationCategoryId),
        donorId: donorId ? Number(donorId) : null,
        receiptNo,
        amount: Number(amount),
        paymentMethod,
        paymentDate: new Date(paymentDate),
        transactionRef: transactionRef || null,
        isAnonymous: isAnonymous ?? false,
        remarks: remarks || null,
        status: status || 'completed',
        createdBy: userId,
      },
      include: {
        donationCategory: { select: { id: true, name: true } },
        donor: { select: { id: true, name: true, phone: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'Donation',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[donations][POST]', err)
    return error('Failed to create donation', 500)
  }
}
