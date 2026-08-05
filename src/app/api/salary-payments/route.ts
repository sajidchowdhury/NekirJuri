// ============================================================
// Salary Payments API — GET (list, filter by month/year), POST (process payment)
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
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const employeeType = searchParams.get('employeeType') || undefined
    const status = searchParams.get('status') || undefined

    const where: Record<string, unknown> = { tenantId }
    if (month) where.month = Number(month)
    if (year) where.year = Number(year)
    if (employeeType) where.employeeType = employeeType
    if (status) where.status = status

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.salaryPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          salaryStructure: {
            select: {
              id: true,
              basicSalary: true,
              totalSalary: true,
              netSalary: true,
            },
          },
          teacher: { select: { id: true, name: true, employeeIdNo: true } },
          employee: { select: { id: true, name: true, employeeIdNo: true } },
        },
      }),
      db.salaryPayment.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'SalaryPayment',
        newValues: JSON.stringify({ month, year, employeeType, status, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[SalaryPayments][GET]', err)
    return error('Failed to fetch salary payments', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()
    const {
      employeeType,
      teacherId,
      employeeId,
      salaryStructureId,
      month,
      year,
      paymentMethod,
      paymentDate,
      transactionRef,
      status = 'paid',
      remarks,
    } = body

    // Validate required fields
    if (!employeeType || !salaryStructureId || !month || !year || !paymentMethod || !paymentDate) {
      return error('employeeType, salaryStructureId, month, year, paymentMethod, and paymentDate are required')
    }
    if (employeeType !== 'teacher' && employeeType !== 'staff') {
      return error('employeeType must be "teacher" or "staff"')
    }

    // Fetch salary structure to get salary breakdown
    const salaryStructure = await db.salaryStructure.findFirst({
      where: { id: Number(salaryStructureId), tenantId, isActive: true },
    })
    if (!salaryStructure) {
      return error('Active salary structure not found', 404)
    }

    // Check for duplicate payment
    const existingPayment = await db.salaryPayment.findFirst({
      where: {
        tenantId,
        employeeType,
        teacherId: employeeType === 'teacher' ? Number(teacherId) : null,
        employeeId: employeeType === 'staff' ? Number(employeeId) : null,
        month: Number(month),
        year: Number(year),
      },
    })
    if (existingPayment) {
      return error('Salary payment already exists for this employee for the given month/year')
    }

    // Calculate totals from salary structure
    const totalAllowance = salaryStructure.houseRent + salaryStructure.medicalAllowance + salaryStructure.transportAllowance + salaryStructure.otherAllowance
    const totalDeduction = salaryStructure.pfDeduction + salaryStructure.taxDeduction + salaryStructure.otherDeduction

    const salaryPayment = await db.salaryPayment.create({
      data: {
        tenantId,
        employeeType,
        teacherId: employeeType === 'teacher' ? Number(teacherId) : null,
        employeeId: employeeType === 'staff' ? Number(employeeId) : null,
        salaryStructureId: Number(salaryStructureId),
        month: Number(month),
        year: Number(year),
        basicSalary: salaryStructure.basicSalary,
        totalAllowance,
        totalDeduction,
        netSalary: salaryStructure.netSalary,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        transactionRef: transactionRef || null,
        status,
        remarks: remarks || null,
        createdBy: userId,
      },
      include: {
        salaryStructure: {
          select: { id: true, basicSalary: true, totalSalary: true, netSalary: true },
        },
        teacher: { select: { id: true, name: true, employeeIdNo: true } },
        employee: { select: { id: true, name: true, employeeIdNo: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'CREATE',
        entityType: 'SalaryPayment',
        entityId: salaryPayment.id,
        newValues: JSON.stringify(salaryPayment),
      },
    })

    return created(salaryPayment, 'Salary payment processed successfully')
  } catch (err) {
    console.error('[SalaryPayments][POST]', err)
    return error('Failed to process salary payment', 500)
  }
}
