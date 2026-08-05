// ============================================================
// Product Categories API — GET (list), POST (create)
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
    const isActive = searchParams.get('isActive')
    const parentId = searchParams.get('parentId')

    const where: Record<string, unknown> = { tenantId }
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'
    if (parentId !== null && parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : Number(parentId)
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          children: { select: { id: true, name: true, code: true } },
          _count: { select: { products: true } },
        },
      }),
      db.productCategory.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'ProductCategory',
        newValues: JSON.stringify({ page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[ProductCategories][GET]', err)
    return error('Failed to fetch product categories', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()
    const {
      name,
      code,
      description,
      parentId,
    } = body

    // Validate required fields
    if (!name) {
      return error('Category name is required')
    }

    // Validate parent category exists and belongs to tenant
    if (parentId) {
      const parent = await db.productCategory.findFirst({
        where: { id: Number(parentId), tenantId },
      })
      if (!parent) {
        return error('Parent category not found', 404)
      }
    }

    const category = await db.productCategory.create({
      data: {
        tenantId,
        name,
        code: code || null,
        description: description || null,
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'ProductCategory',
        entityId: category.id,
        newValues: JSON.stringify(category),
      },
    })

    return created(category, 'Product category created successfully')
  } catch (err) {
    console.error('[ProductCategories][POST]', err)
    return error('Failed to create product category', 500)
  }
}
