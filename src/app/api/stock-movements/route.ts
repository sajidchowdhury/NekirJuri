// ============================================================
// Stock Movements API — GET (list, filter by productId/movementType), POST (manual stock adjustment)
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
    const productId = searchParams.get('productId')
    const movementType = searchParams.get('movementType') || undefined
    const referenceType = searchParams.get('referenceType') || undefined
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const where: Record<string, unknown> = { tenantId }
    if (productId) where.productId = Number(productId)
    if (movementType) where.movementType = movementType
    if (referenceType) where.referenceType = referenceType

    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {}
      if (fromDate) createdAt.gte = new Date(fromDate)
      if (toDate) createdAt.lte = new Date(toDate)
      where.createdAt = createdAt
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, code: true, unit: true, currentStock: true } },
        },
      }),
      db.stockMovement.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'StockMovement',
        newValues: JSON.stringify({ productId, movementType, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[StockMovements][GET]', err)
    return error('Failed to fetch stock movements', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()
    const {
      productId,
      movementType,
      quantity,
      remarks,
    } = body

    // Validate required fields
    if (!productId || !movementType || quantity === undefined || quantity === null) {
      return error('productId, movementType, and quantity are required')
    }

    const validMovementTypes = ['in', 'out', 'adjustment', 'transfer']
    if (!validMovementTypes.includes(movementType)) {
      return error(`movementType must be one of: ${validMovementTypes.join(', ')}`)
    }

    // Validate product exists and belongs to tenant
    const product = await db.product.findFirst({
      where: { id: Number(productId), tenantId, deletedAt: null },
    })
    if (!product) {
      return error('Product not found', 404)
    }

    const qty = Number(quantity)

    // For 'out' movement, check if sufficient stock exists
    if (movementType === 'out' && product.currentStock < qty) {
      return error(`Insufficient stock. Current stock: ${product.currentStock}, requested: ${qty}`)
    }

    // Calculate new stock level
    let newStock: number
    switch (movementType) {
      case 'in':
        newStock = product.currentStock + qty
        break
      case 'out':
        newStock = product.currentStock - qty
        break
      case 'adjustment':
        // For adjustment, quantity is the absolute new stock level
        newStock = qty
        break
      case 'transfer':
        // Transfer out from this product
        newStock = product.currentStock - qty
        break
      default:
        newStock = product.currentStock
    }

    // Create stock movement and update product stock in a transaction
    const stockMovement = await db.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          tenantId,
          productId: Number(productId),
          movementType,
          quantity: qty,
          referenceType: 'manual',
          remarks: remarks || `Manual ${movementType} adjustment of ${qty} units`,
          stockAfter: newStock,
          createdBy: userId,
        },
      })

      // Update product stock
      await tx.product.update({
        where: { id: Number(productId) },
        data: {
          currentStock: newStock,
          updatedBy: userId,
        },
      })

      return movement
    })

    // Fetch with includes for response
    const result = await db.stockMovement.findUnique({
      where: { id: stockMovement.id },
      include: {
        product: { select: { id: true, name: true, code: true, unit: true, currentStock: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'StockMovement',
        entityId: stockMovement.id,
        newValues: JSON.stringify({
          productId,
          movementType,
          quantity: qty,
          previousStock: product.currentStock,
          newStock,
        }),
      },
    })

    return created(result, `Stock ${movementType} recorded successfully. New stock: ${newStock}`)
  } catch (err) {
    console.error('[StockMovements][POST]', err)
    return error('Failed to record stock movement', 500)
  }
}
