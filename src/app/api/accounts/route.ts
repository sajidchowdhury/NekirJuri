// ============================================================
// Chart of Accounts API — GET (list, filter by accountType), POST (create account)
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
    const accountType = searchParams.get('accountType') || undefined
    const isActive = searchParams.get('isActive')
    const parentId = searchParams.get('parentId')

    const where: Record<string, unknown> = { tenantId }
    if (accountType) where.accountType = accountType
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'
    if (parentId !== null && parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : Number(parentId)
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.chartOfAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
        include: {
          parent: { select: { id: true, code: true, name: true } },
          children: { select: { id: true, code: true, name: true, accountType: true } },
          _count: { select: { journalItems: true } },
        },
      }),
      db.chartOfAccount.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'ChartOfAccount',
        newValues: JSON.stringify({ accountType, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[Accounts][GET]', err)
    return error('Failed to fetch chart of accounts', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()
    const {
      code,
      name,
      accountType,
      parentId,
      openingBalance = 0,
      description,
    } = body

    // Validate required fields
    if (!code || !name || !accountType) {
      return error('code, name, and accountType are required')
    }

    const validAccountTypes = ['asset', 'liability', 'equity', 'income', 'expense']
    if (!validAccountTypes.includes(accountType)) {
      return error(`accountType must be one of: ${validAccountTypes.join(', ')}`)
    }

    // Check for duplicate code within tenant
    const existing = await db.chartOfAccount.findFirst({
      where: { tenantId, code },
    })
    if (existing) {
      return error('Account code already exists within this tenant')
    }

    // Validate parent account exists and belongs to tenant
    if (parentId) {
      const parent = await db.chartOfAccount.findFirst({
        where: { id: Number(parentId), tenantId },
      })
      if (!parent) {
        return error('Parent account not found', 404)
      }
    }

    const account = await db.chartOfAccount.create({
      data: {
        tenantId,
        code,
        name,
        accountType,
        parentId: parentId ? Number(parentId) : null,
        openingBalance: Number(openingBalance),
        currentBalance: Number(openingBalance),
        description: description || null,
      },
      include: {
        parent: { select: { id: true, code: true, name: true } },
        children: { select: { id: true, code: true, name: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'ChartOfAccount',
        entityId: account.id,
        newValues: JSON.stringify(account),
      },
    })

    return created(account, 'Account created successfully')
  } catch (err) {
    console.error('[Accounts][POST]', err)
    return error('Failed to create account', 500)
  }
}
