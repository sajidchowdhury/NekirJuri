// ============================================================
// Sales API — GET (list sales invoices, filter by studentId/status), POST (create sale with items, reduce stock, create movements)
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
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status') || undefined
    const paymentStatus = searchParams.get('paymentStatus') || undefined
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const where: Record<string, unknown> = { tenantId }
    if (studentId) where.studentId = Number(studentId)
    if (status) where.status = status
    if (paymentStatus) where.paymentStatus = paymentStatus

    if (fromDate || toDate) {
      const saleDate: Record<string, Date> = {}
      if (fromDate) saleDate.gte = new Date(fromDate)
      if (toDate) saleDate.lte = new Date(toDate)
      where.saleDate = saleDate
    }

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.salesInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { id: true, name: true, registrationNo: true } },
          salesItems: {
            include: {
              product: { select: { id: true, name: true, code: true, unit: true } },
            },
            orderBy: { id: 'asc' },
          },
        },
      }),
      db.salesInvoice.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'SalesInvoice',
        newValues: JSON.stringify({ studentId, status, paymentStatus, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[Sales][GET]', err)
    return error('Failed to fetch sales invoices', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()
    const {
      invoiceNo,
      studentId,
      customerName,
      saleDate,
      items,
      discountAmount = 0,
      paymentMethod,
      paymentStatus = 'paid',
      status = 'completed',
      remarks,
    } = body

    // Validate required fields
    if (!invoiceNo || !saleDate || !paymentMethod) {
      return error('invoiceNo, saleDate, and paymentMethod are required')
    }
    if (!studentId && !customerName) {
      return error('Either studentId or customerName is required')
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one sale item is required')
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.unitPrice) {
        return error('Each item must have productId, quantity, and unitPrice')
      }
    }

    // Check for duplicate invoiceNo within tenant
    const existing = await db.salesInvoice.findFirst({
      where: { tenantId, invoiceNo },
    })
    if (existing) {
      return error('Invoice number already exists within this tenant')
    }

    // Validate student if provided
    if (studentId) {
      const student = await db.student.findFirst({
        where: { id: Number(studentId), tenantId, deletedAt: null },
      })
      if (!student) {
        return error('Student not found', 404)
      }
    }

    // Validate all products exist, belong to tenant, and have sufficient stock
    const productIds = items.map((item: { productId: number }) => Number(item.productId))
    const products = await db.product.findMany({
      where: { id: { in: productIds }, tenantId, deletedAt: null, isActive: true },
    })
    if (products.length !== productIds.length) {
      return error('One or more products not found or inactive')
    }

    // Check stock availability for all items
    for (const item of items) {
      const product = products.find((p) => p.id === Number(item.productId))
      if (product && product.currentStock < Number(item.quantity)) {
        return error(`Insufficient stock for product "${product.name}" (Code: ${product.code}). Available: ${product.currentStock}, Requested: ${item.quantity}`)
      }
    }

    // Calculate amounts
    const totalAmount = items.reduce((sum: number, item: { quantity: number; unitPrice: number; discountAmount?: number }) => {
      const itemTotal = Number(item.quantity) * Number(item.unitPrice) - (Number(item.discountAmount) || 0)
      return sum + itemTotal
    }, 0)
    const netAmount = totalAmount - Number(discountAmount)

    // Create sales invoice with items, reduce stock, create stock movements — all in a transaction
    const salesInvoice = await db.$transaction(async (tx) => {
      // Create the sales invoice
      const invoice = await tx.salesInvoice.create({
        data: {
          tenantId,
          invoiceNo,
          studentId: studentId ? Number(studentId) : null,
          customerName: customerName || null,
          saleDate: new Date(saleDate),
          totalAmount,
          discountAmount: Number(discountAmount),
          netAmount,
          paymentMethod,
          paymentStatus,
          remarks: remarks || null,
          status,
          createdBy: userId,
        },
      })

      // Create sales items, reduce product stock, create stock movements
      const salesItems = await Promise.all(
        items.map(async (item: { productId: number; quantity: number; unitPrice: number; discountAmount?: number }) => {
          const quantity = Number(item.quantity)
          const unitPrice = Number(item.unitPrice)
          const itemDiscount = Number(item.discountAmount) || 0
          const totalPrice = quantity * unitPrice - itemDiscount
          const productId = Number(item.productId)

          // Create sales item
          const si = await tx.salesItem.create({
            data: {
              tenantId,
              salesInvoiceId: invoice.id,
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

          const newStock = product.currentStock - quantity

          // Update product stock: currentStock -= quantity
          await tx.product.update({
            where: { id: productId },
            data: {
              currentStock: newStock,
              updatedBy: userId,
            },
          })

          // Create stock movement (type='out')
          await tx.stockMovement.create({
            data: {
              tenantId,
              productId,
              movementType: 'out',
              quantity,
              referenceType: 'sale',
              referenceId: invoice.id,
              remarks: `Sale Invoice #${invoiceNo} - ${quantity} units sold`,
              stockAfter: newStock,
              createdBy: userId,
            },
          })

          return si
        })
      )

      return { ...invoice, salesItems }
    })

    // Fetch full result with includes
    const result = await db.salesInvoice.findUnique({
      where: { id: salesInvoice.id },
      include: {
        student: { select: { id: true, name: true, registrationNo: true } },
        salesItems: {
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
        entityType: 'SalesInvoice',
        entityId: salesInvoice.id,
        newValues: JSON.stringify(result),
      },
    })

    return created(result, 'Sale invoice created successfully with stock updated')
  } catch (err) {
    console.error('[Sales][POST]', err)
    return error('Failed to create sales invoice', 500)
  }
}
