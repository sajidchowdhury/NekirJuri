// ============================================================
// Journal Entries API — GET (list, filter by status/date), POST (create with items, validate debit=credit)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)

    const { searchParams } = request.nextUrl
    const pagination = getPaginationParams(request.nextUrl)
    const status = searchParams.get('status') || undefined
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const referenceType = searchParams.get('referenceType') || undefined

    const where: Record<string, unknown> = { tenantId }
    if (status) where.status = status
    if (referenceType) where.referenceType = referenceType

    // Date range filter
    if (fromDate || toDate) {
      const entryDate: Record<string, Date> = {}
      if (fromDate) entryDate.gte = new Date(fromDate)
      if (toDate) entryDate.lte = new Date(toDate)
      where.entryDate = entryDate
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.journalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          journalItems: {
            include: {
              account: { select: { id: true, code: true, name: true, accountType: true } },
            },
            orderBy: { id: 'asc' },
          },
        },
      }),
      db.journalEntry.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'JournalEntry',
        newValues: JSON.stringify({ status, fromDate, toDate, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[JournalEntries][GET]', err)
    return error('Failed to fetch journal entries', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()
    const {
      entryNo,
      entryDate,
      narration,
      referenceType,
      referenceId,
      status = 'draft',
      items,
    } = body

    // Validate required fields
    if (!entryNo || !entryDate) {
      return error('entryNo and entryDate are required')
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one journal entry item is required')
    }

    // Validate each item has accountId and either debit or credit
    for (const item of items) {
      if (!item.accountId) {
        return error('Each item must have an accountId')
      }
      if (!item.debit && !item.credit) {
        return error('Each item must have either a debit or credit value')
      }
    }

    // Validate that all accounts exist and belong to tenant
    const accountIds = items.map((item: { accountId: number }) => Number(item.accountId))
    const accounts = await db.chartOfAccount.findMany({
      where: { id: { in: accountIds }, tenantId, isActive: true },
    })
    if (accounts.length !== accountIds.length) {
      return error('One or more accounts not found or inactive')
    }

    // Calculate total debit and credit
    const totalDebit = items.reduce((sum: number, item: { debit?: number }) => sum + (Number(item.debit) || 0), 0)
    const totalCredit = items.reduce((sum: number, item: { credit?: number }) => sum + (Number(item.credit) || 0), 0)

    // Validate double-entry: total debit must equal total credit (within tolerance of 0.01)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return error(`Journal entry is not balanced. Total debit (${totalDebit}) does not equal total credit (${totalCredit}). Difference: ${Math.abs(totalDebit - totalCredit).toFixed(2)}`)
    }

    // Check for duplicate entryNo within tenant
    const existing = await db.journalEntry.findFirst({
      where: { tenantId, entryNo },
    })
    if (existing) {
      return error('Journal entry number already exists within this tenant')
    }

    // Create journal entry with items in a transaction
    const journalEntry = await db.$transaction(async (tx) => {
      // Create the journal entry
      const je = await tx.journalEntry.create({
        data: {
          tenantId,
          entryNo,
          entryDate: new Date(entryDate),
          narration: narration || null,
          referenceType: referenceType || null,
          referenceId: referenceId ? Number(referenceId) : null,
          totalDebit,
          totalCredit,
          status,
          createdBy: userId,
        },
      })

      // Create journal entry items
      const journalItems = await Promise.all(
        items.map((item: { accountId: number; debit?: number; credit?: number; narration?: string }) =>
          tx.journalEntryItem.create({
            data: {
              tenantId,
              journalEntryId: je.id,
              accountId: Number(item.accountId),
              debit: Number(item.debit) || 0,
              credit: Number(item.credit) || 0,
              narration: item.narration || null,
            },
          })
        )
      )

      // Update account current balances
      for (const item of items) {
        const account = accounts.find((a) => a.id === Number(item.accountId))
        if (!account) continue

        const debit = Number(item.debit) || 0
        const credit = Number(item.credit) || 0

        // For asset/expense: debit increases, credit decreases
        // For liability/equity/income: credit increases, debit decreases
        let balanceChange: number
        if (account.accountType === 'asset' || account.accountType === 'expense') {
          balanceChange = debit - credit
        } else {
          balanceChange = credit - debit
        }

        await tx.chartOfAccount.update({
          where: { id: account.id },
          data: { currentBalance: account.currentBalance + balanceChange },
        })
      }

      return { ...je, journalItems }
    })

    // Fetch with includes for response
    const result = await db.journalEntry.findUnique({
      where: { id: journalEntry.id },
      include: {
        journalItems: {
          include: {
            account: { select: { id: true, code: true, name: true, accountType: true } },
          },
          orderBy: { id: 'asc' },
        },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'JournalEntry',
        entityId: journalEntry.id,
        newValues: JSON.stringify(result),
      },
    })

    return created(result, 'Journal entry created successfully')
  } catch (err) {
    console.error('[JournalEntries][POST]', err)
    return error('Failed to create journal entry', 500)
  }
}
