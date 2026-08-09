// ============================================================
// Suppliers API — GET (list with search), POST (create)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { supplierCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)

    const { searchParams } = request.nextUrl
    const pagination = getPaginationParams(request.nextUrl)
    const search = searchParams.get('search') || undefined
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { contactPerson: { contains: search } },
      ]
    }
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { purchases: true } },
        },
      }),
      db.supplier.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'Supplier',
        newValues: JSON.stringify({ search, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[Suppliers][GET]', err)
    return error('Failed to fetch suppliers', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = supplierCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const {
      name,
      code,
      phone,
      email,
      address,
      city,
      contactPerson,
      nidNo,
      bankAccount,
    } = parsed.data

    // Check for duplicate code within tenant
    if (code) {
      const existing = await db.supplier.findFirst({
        where: { tenantId, code, deletedAt: null },
      })
      if (existing) {
        return error('Supplier code already exists within this tenant')
      }
    }

    const supplier = await db.supplier.create({
      data: {
        tenantId,
        name,
        code: code || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        contactPerson: contactPerson || null,
        nidNo: nidNo || null,
        bankAccount: bankAccount || null,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'Supplier',
        entityId: supplier.id,
        newValues: JSON.stringify(supplier),
      },
    })

    return created(supplier, 'Supplier created successfully')
  } catch (err) {
    console.error('[Suppliers][POST]', err)
    return error('Failed to create supplier', 500)
  }
}
