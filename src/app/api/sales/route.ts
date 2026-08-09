// ============================================================
// Sales API — GET (list sales invoices, filter by studentId/status), POST (create sale with items, reduce stock, create movements)
// CR-4: Enhanced POST to handle addToFee — adds sale amount to student's fee invoice as a line item
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { salesCreateSchema, formatZodError } from '@/lib/validations'

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
          feeInvoice: { select: { id: true, invoiceNo: true, status: true } },
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

/** Find or create a "Product Purchase" FeeCategory for the tenant */
async function getOrCreateProductPurchaseCategory(tenantId: number): Promise<number> {
  // Try to find existing category with code 'product-purchase'
  let category = await db.feeCategory.findFirst({
    where: { tenantId, code: 'product-purchase' },
  })

  if (!category) {
    // Create the system category
    category = await db.feeCategory.create({
      data: {
        tenantId,
        name: 'Product Purchase',
        code: 'product-purchase',
        description: 'Products sold to student — added from sales invoice',
        amount: 0,
        isRecurring: false,
        isActive: true,
      },
    })
  }

  return category.id
}

/** Generate the next fee invoice number for a tenant in a given year */
async function generateFeeInvoiceNo(tenantId: number, year: number, tx: unknown): Promise<string> {
  const prisma = tx as Parameters<Parameters<typeof db.$transaction>[0]>['0']
  const prefix = `INV-${year}-`
  const last = await prisma.feeInvoice.findFirst({
    where: {
      tenantId,
      invoiceNo: { startsWith: prefix },
    },
    orderBy: { invoiceNo: 'desc' },
    select: { invoiceNo: true },
  })
  let seq = 1
  if (last) {
    const parts = last.invoiceNo.split('-')
    seq = (Number(parts[parts.length - 1]) || 0) + 1
  }
  return `${prefix}${String(seq).padStart(5, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = salesCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

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
      addToFee = false,
    } = parsed.data

    if (!studentId && !customerName) {
      return error('Either studentId or customerName is required')
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one sale item is required')
    }

    // CR-4: addToFee requires a studentId
    if (addToFee && !studentId) {
      return error('addToFee can only be used when a studentId is provided')
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
    let studentRecord: { id: number; classId: number; academicSessionId: number } | null = null
    if (studentId) {
      studentRecord = await db.student.findFirst({
        where: { id: Number(studentId), tenantId, deletedAt: null },
        select: { id: true, classId: true, academicSessionId: true },
      })
      if (!studentRecord) {
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

    // CR-4: If addToFee, get or create the product-purchase fee category
    let productPurchaseCategoryId: number | null = null
    if (addToFee && studentId) {
      productPurchaseCategoryId = await getOrCreateProductPurchaseCategory(tenantId)
    }

    // Create sales invoice with items, reduce stock, create stock movements — all in a transaction
    // CR-4: Also handles addToFee logic within the same transaction
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
          paymentMethod: addToFee ? 'fee-invoice' : paymentMethod,
          paymentStatus: addToFee ? 'unpaid' : paymentStatus,
          addToFee: addToFee ? true : false,
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

      // CR-4: If addToFee is true, find or create fee invoice and add product purchase item
      let feeInvoiceId: number | null = null
      if (addToFee && studentId && studentRecord && productPurchaseCategoryId) {
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        // Find the student's current month fee invoice
        let feeInvoice = await tx.feeInvoice.findFirst({
          where: {
            tenantId,
            studentId: Number(studentId),
            feeMonth: currentMonth,
            feeYear: currentYear,
            deletedAt: null,
            status: { in: ['unpaid', 'partial'] },
          },
        })

        if (feeInvoice) {
          // Add product purchase item to existing invoice and update totals
          await tx.feeInvoiceItem.create({
            data: {
              tenantId,
              invoiceId: feeInvoice.id,
              feeCategoryId: productPurchaseCategoryId,
              salesInvoiceId: invoice.id,
              amount: netAmount,
              discountAmount: 0,
              netAmount: netAmount,
              description: `Product Sale #${invoiceNo} — ${products.map(p => p.name).join(', ')}`,
            },
          })

          // Recalculate invoice totals
          const allItems = await tx.feeInvoiceItem.findMany({
            where: { invoiceId: feeInvoice.id },
          })
          const newTotalAmount = allItems.reduce((sum, i) => sum + Number(i.netAmount), 0)
          const newBalance = newTotalAmount - Number(feeInvoice.paidAmount) - Number(feeInvoice.discountAmount) + Number(feeInvoice.fineAmount)

          await tx.feeInvoice.update({
            where: { id: feeInvoice.id },
            data: {
              totalAmount: newTotalAmount,
              balance: newBalance,
              status: newBalance <= 0 ? 'paid' : Number(feeInvoice.paidAmount) > 0 ? 'partial' : 'unpaid',
            },
          })

          feeInvoiceId = feeInvoice.id
        } else {
          // Create a new fee invoice for this month with the product purchase item
          const newInvoiceNo = await generateFeeInvoiceNo(tenantId, currentYear, tx)
          const dueDate = new Date(currentYear, currentMonth, 10) // 10th of next month

          feeInvoice = await tx.feeInvoice.create({
            data: {
              tenantId,
              invoiceNo: newInvoiceNo,
              studentId: Number(studentId),
              academicSessionId: studentRecord.academicSessionId,
              classId: studentRecord.classId,
              issueDate: now,
              dueDate,
              totalAmount: netAmount,
              paidAmount: 0,
              discountAmount: 0,
              fineAmount: 0,
              balance: netAmount,
              status: 'unpaid',
              feeMonth: currentMonth,
              feeYear: currentYear,
              remarks: `Product purchase invoice — Sale #${invoiceNo}`,
              createdBy: userId,
              invoiceItems: {
                create: {
                  tenantId,
                  feeCategoryId: productPurchaseCategoryId,
                  salesInvoiceId: invoice.id,
                  amount: netAmount,
                  discountAmount: 0,
                  netAmount: netAmount,
                  description: `Product Sale #${invoiceNo} — ${products.map(p => p.name).join(', ')}`,
                },
              },
            },
          })

          feeInvoiceId = feeInvoice.id
        }

        // Link the sales invoice to the fee invoice
        await tx.salesInvoice.update({
          where: { id: invoice.id },
          data: { feeInvoiceId },
        })
      }

      return { ...invoice, salesItems, feeInvoiceId }
    })

    // Fetch full result with includes
    const result = await db.salesInvoice.findUnique({
      where: { id: salesInvoice.id },
      include: {
        student: { select: { id: true, name: true, registrationNo: true } },
        feeInvoice: { select: { id: true, invoiceNo: true, status: true } },
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

    const message = addToFee
      ? 'Sale created and added to student\'s monthly fee invoice'
      : 'Sale invoice created successfully with stock updated'

    return created(result, message)
  } catch (err) {
    console.error('[Sales][POST]', err)
    return error('Failed to create sales invoice', 500)
  }
}
