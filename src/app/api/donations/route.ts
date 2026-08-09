// ============================================================
// Donations API — GET (list with filters), POST (create with receipt)
// CR-5: Recurring donations — isRecurring, recurringFrequency, nextDueDate
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
  success,
} from '@/lib/api-utils'
import { donationCreateSchema, donationUpdateSchema, formatZodError } from '@/lib/validations'

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

/** Calculate nextDueDate based on frequency and current date */
function calculateNextDueDate(frequency: string, fromDate: Date): Date {
  const next = new Date(fromDate)
  if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1)
  } else if (frequency === 'yearly') {
    next.setFullYear(next.getFullYear() + 1)
  }
  return next
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
    const isRecurring = url.searchParams.get('isRecurring')
    const upcomingDays = url.searchParams.get('upcomingDays')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (donationCategoryId) where.donationCategoryId = Number(donationCategoryId)
    if (donorId) where.donorId = Number(donorId)
    if (status) where.status = status
    if (paymentMethod) where.paymentMethod = paymentMethod
    if (isRecurring !== null && isRecurring !== undefined && isRecurring !== '') {
      where.isRecurring = isRecurring === 'true'
    }

    // CR-5: Filter upcoming recurring donations (nextDueDate within N days)
    if (upcomingDays) {
      const now = new Date()
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + Number(upcomingDays))
      where.isRecurring = true
      where.nextDueDate = { gte: now, lte: futureDate }
    }

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
          donor: { select: { id: true, name: true, phone: true, email: true, reminderConsent: true } },
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
// CR-5: If isRecurring, calculate nextDueDate and update donor totalPledged
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = donationCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const {
      donationCategoryId,
      donorId,
      amount,
      paymentMethod,
      paymentDate,
      transactionRef,
      isAnonymous,
      isRecurring = false,
      recurringFrequency,
      recurringAmount,
      remarks,
      status,
    } = parsed.data

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

    // CR-5: Calculate nextDueDate for recurring donations
    let nextDueDate: Date | null = null
    const pledgeAmount = recurringAmount ? Number(recurringAmount) : Number(amount)
    if (isRecurring) {
      nextDueDate = calculateNextDueDate(recurringFrequency, new Date(paymentDate))
    }

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
        isRecurring: isRecurring ? true : false,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        recurringAmount: isRecurring ? pledgeAmount : null,
        nextDueDate,
        reminderSent: false,
        lastPaymentDate: isRecurring ? new Date(paymentDate) : null,
        remarks: remarks || null,
        status: status || 'completed',
        createdBy: userId,
      },
      include: {
        donationCategory: { select: { id: true, name: true } },
        donor: { select: { id: true, name: true, phone: true } },
      },
    })

    // CR-5: Update donor's totalPledged if recurring
    if (isRecurring && donorId) {
      await db.donor.update({
        where: { id: Number(donorId) },
        data: {
          totalPledged: { increment: pledgeAmount },
          isRegular: true,
        },
      })
    }

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

    const message = isRecurring
      ? `Recurring donation created (${recurringFrequency}). Next due: ${nextDueDate?.toLocaleDateString()}`
      : undefined

    return created(record, message)
  } catch (err) {
    console.error('[donations][POST]', err)
    return error('Failed to create donation', 500)
  }
}

// --- PATCH: Record payment for recurring donation, advance nextDueDate ---
export async function PATCH(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = donationUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const { id, amount, paymentDate, paymentMethod, transactionRef } = body

    // Find the recurring donation
    const donation = await db.donation.findFirst({
      where: { id: Number(id), tenantId: tid, isRecurring: true },
      include: { donor: { select: { id: true, name: true } } },
    })

    if (!donation) {
      return error('Recurring donation not found', 404)
    }

    if (!donation.recurringFrequency) {
      return error('Donation is not a recurring donation')
    }

    // Update the donation: advance nextDueDate, reset reminderSent
    const newNextDueDate = calculateNextDueDate(donation.recurringFrequency, new Date(paymentDate))

    const updated = await db.donation.update({
      where: { id: donation.id },
      data: {
        amount: Number(amount),
        paymentDate: new Date(paymentDate),
        paymentMethod: paymentMethod || donation.paymentMethod,
        transactionRef: transactionRef || donation.transactionRef,
        lastPaymentDate: new Date(paymentDate),
        nextDueDate: newNextDueDate,
        reminderSent: false,
        status: 'completed',
        updatedAt: new Date(),
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
        action: 'UPDATE',
        entityType: 'Donation',
        entityId: donation.id,
        newValues: JSON.stringify({ action: 'recurring_payment', amount, nextDueDate: newNextDueDate }),
      },
    })

    return success(updated, `Recurring payment recorded. Next due: ${newNextDueDate.toLocaleDateString()}`)
  } catch (err) {
    console.error('[donations][PATCH]', err)
    return error('Failed to record recurring payment', 500)
  }
}
