// ============================================================
// Products API — GET (list with search, filter by categoryId, low stock alert), POST (create)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { productCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)

    const { searchParams } = request.nextUrl
    const pagination = getPaginationParams(request.nextUrl)
    const search = searchParams.get('search') || undefined
    const categoryId = searchParams.get('categoryId')
    const lowStock = searchParams.get('lowStock')
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (categoryId) where.categoryId = Number(categoryId)
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'

    // Low stock filter: products where currentStock <= minStockLevel
    if (lowStock === 'true') {
      where.currentStock = { lte: 0 }  // Will be handled with raw filter
      // Actually, we need currentStock <= minStockLevel. Use raw approach.
      delete where.currentStock
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    let items
    let total

    if (lowStock === 'true') {
      // Low stock: currentStock <= minStockLevel AND minStockLevel > 0
      const lowStockWhere = {
        ...where,
        minStockLevel: { gt: 0 },
        currentStock: { lte: 0 }, // Start with lte 0 as base
      }
      // We need a more complex query. Use Prisma's raw where with OR for comparison
      // SQLite doesn't support field comparison in Prisma, so we fetch and filter
      const allProducts = await db.product.findMany({
        where: { ...where, minStockLevel: { gt: 0 } },
        include: {
          category: { select: { id: true, name: true, code: true } },
        },
        orderBy: { name: 'asc' },
      })
      const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.minStockLevel)
      total = lowStockProducts.length
      items = lowStockProducts.slice(skip, skip + limit)
    } else {
      ;[items, total] = await Promise.all([
        db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
          include: {
            category: { select: { id: true, name: true, code: true } },
          },
        }),
        db.product.count({ where }),
      ])
    }

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'Product',
        newValues: JSON.stringify({ search, categoryId, lowStock, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[Products][GET]', err)
    return error('Failed to fetch products', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = productCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const {
      name,
      code,
      categoryId,
      description,
      unit,
      purchasePrice = 0,
      salePrice = 0,
      minStockLevel = 0,
      maxStockLevel,
      hasExpiry = false,
    } = parsed.data

    // Check for duplicate code within tenant
    const existing = await db.product.findFirst({
      where: { tenantId, code, deletedAt: null },
    })
    if (existing) {
      return error('Product code already exists within this tenant')
    }

    // Validate category exists and belongs to tenant
    const category = await db.productCategory.findFirst({
      where: { id: Number(categoryId), tenantId },
    })
    if (!category) {
      return error('Product category not found', 404)
    }

    const product = await db.product.create({
      data: {
        tenantId,
        name,
        code,
        categoryId: Number(categoryId),
        description: description || null,
        unit: unit || null,
        purchasePrice: Number(purchasePrice),
        salePrice: Number(salePrice),
        currentStock: 0,
        minStockLevel: Number(minStockLevel),
        maxStockLevel: maxStockLevel ? Number(maxStockLevel) : null,
        hasExpiry,
        createdBy: userId,
      },
      include: {
        category: { select: { id: true, name: true, code: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'Product',
        entityId: product.id,
        newValues: JSON.stringify(product),
      },
    })

    return created(product, 'Product created successfully')
  } catch (err) {
    console.error('[Products][POST]', err)
    return error('Failed to create product', 500)
  }
}
