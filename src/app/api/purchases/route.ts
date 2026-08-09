// ============================================================
// Purchases API — GET (list, filter by supplierId/status), POST (create with items, update stock, create movements)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { purchaseCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)

    const { searchParams } = request.nextUrl
    const pagination = getPaginationParams(request.nextUrl)
    const supplierId = searchParams.get('supplierId')
    const status = searchParams.get('status') || undefined
    const paymentStatus = searchParams.get('paymentStatus') || undefined
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const where: Record<string, unknown> = { tenantId }
    if (supplierId) where.supplierId = Number(supplierId)
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    if (fromDate || toDate) {
      const purchaseDate: Record<string, Date> = {}
      if (fromDate) purchaseDate.gte = new Date(fromDate)
      if (toDate) purchaseDate.lte = new Date(toDate)
      where.purchaseDate = purchaseDate
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true, code: true, phone: true } },
          purchaseItems: {
            include: {
              product: { select: { id: true, name: true, code: true, unit: true } },
            },
            orderBy: { id: 'asc' },
          },
        },
      }),
      db.purchase.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'Purchase',
        newValues: JSON.stringify({ supplierId, status, paymentStatus, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[Purchases][GET]', err)
    return error('Failed to fetch purchases', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = purchaseCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const {
      purchaseNo,
      supplierId,
      purchaseDate,
      items,
      discountAmount = 0,
      taxAmount = 0,
      paymentMethod,
      paymentStatus = 'unpaid',
      status = 'received',
      remarks,
    } = parsed.data

    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one purchase item is required')
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return error('Each item must have productId, quantity, and unitPrice')
      }
    }

    // Validate supplier exists and belongs to tenant
    const supplier = await db.supplier.findFirst({
      where: { id: Number(supplierId), tenantId, deletedAt: null },
    })
    if (!supplier) {
      return error('Supplier not found', 404)
    }

    // Check for duplicate purchaseNo within tenant
    const existing = await db.purchase.findFirst({
      where: { tenantId, purchaseNo },
    })
    if (existing) {
      return error('Purchase number already exists within this tenant')
    }

    // Validate all products exist and belong to tenant
    const productIds = items.map((item: { productId: number }) => Number(item.productId))
    const products = await db.product.findMany({
      where: { id: { in: productIds }, tenantId, deletedAt: null },
    })
    if (products.length !== productIds.length) {
      return error('One or more products not found')
    }

    // Calculate amounts
    const totalAmount = items.reduce((sum: number, item: { quantity: number; unitPrice: number; discountAmount?: number }) => {
      const itemTotal = Number(item.quantity) * Number(item.unitPrice) - (Number(item.discountAmount) || 0)
      return sum + itemTotal
    }, 0)
    const netAmount = totalAmount - Number(discountAmount) + Number(taxAmount)

    // Create purchase with items, update stock, create stock movements — all in a transaction
    const purchase = await db.$transaction(async (tx) => {
      // Create the purchase
      const p = await tx.purchase.create({
        data: {
          tenantId,
          purchaseNo,
          supplierId: Number(supplierId),
          purchaseDate: new Date(purchaseDate),
          totalAmount,
          discountAmount: Number(discountAmount),
          taxAmount: Number(taxAmount),
          netAmount,
          paymentStatus,
          paymentMethod: paymentMethod || null,
          remarks: remarks || null,
          status,
          createdBy: userId,
        },
      })

      // Create purchase items and update product stock + create stock movements
      const purchaseItems = await Promise.all(
        items.map(async (item: { productId: number; quantity: number; unitPrice: number; discountAmount?: number }) => {
          const quantity = Number(item.quantity)
          const unitPrice = Number(item.unitPrice)
          const itemDiscount = Number(item.discountAmount) || 0
          const totalPrice = quantity * unitPrice - itemDiscount
          const productId = Number(item.productId)

          // Create purchase item
          const pi = await tx.purchaseItem.create({
            data: {
              tenantId,
              purchaseId: p.id,
              productId,
              quantity,
              unitPrice,
              totalPrice,
              discountAmount: itemDiscount,
            },
          })

          // Get current product stock
          const product = await tx.product.findUnique({ where: { id: productId } })
          if (!product) throw new Error(`Product ${productId} not found`)

          const newStock = product.currentStock + quantity

          // Update product stock: currentStock += quantity
          await tx.product.update({
            where: { id: productId },
            data: { currentStock: newStock },
          })

          // Create stock movement (type='in')
          await tx.stockMovement.create({
            data: {
              tenantId,
              productId,
              movementType: 'in',
              quantity,
              referenceType: 'purchase',
              referenceId: p.id,
              remarks: `Purchase #${purchaseNo} - ${quantity} units received`,
              stockAfter: newStock,
              createdBy: userId,
            },
          })

          return pi
        })
      )

      return { ...p, purchaseItems }
    })

    // Fetch full result with includes
    const result = await db.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        supplier: { select: { id: true, name: true, code: true, phone: true } },
        purchaseItems: {
          include: {
            product: { select: { id: true, name: true, code: true, unit: true, currentStock: true } },
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
        entityType: 'Purchase',
        entityId: purchase.id,
        newValues: JSON.stringify(result),
      },
    })

    return created(result, 'Purchase created successfully with stock updated')
  } catch (err) {
    console.error('[Purchases][POST]', err)
    return error('Failed to create purchase', 500)
  }
}
