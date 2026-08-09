// ============================================================
// Salary Structures API — GET (list, filter by employeeType), POST (create with auto-calc)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { salaryStructureCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)

    const { searchParams } = request.nextUrl
    const pagination = getPaginationParams(request.nextUrl)
    const employeeType = searchParams.get('employeeType') || undefined
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = { tenantId }
    if (employeeType) where.employeeType = employeeType
    if (isActive !== null && isActive !== undefined) where.isActive = isActive === 'true'

    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      db.salaryStructure.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: { select: { id: true, name: true, employeeIdNo: true } },
          employee: { select: { id: true, name: true, employeeIdNo: true } },
        },
      }),
      db.salaryStructure.count({ where }),
    ])

    // Audit log
    const userId = getUserId(request)
    await db.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'LIST',
        entityType: 'SalaryStructure',
        newValues: JSON.stringify({ employeeType, page, limit }),
      },
    })

    return paginated(items, total, pagination)
  } catch (err) {
    console.error('[SalaryStructures][GET]', err)
    return error('Failed to fetch salary structures', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return error('Tenant context required', 401)
    const userId = getUserId(request)

    const body = await request.json()

    // Zod validation
    const parsed = salaryStructureCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    const {
      employeeType,
      teacherId,
      employeeId,
      basicSalary,
      houseRent = 0,
      medicalAllowance = 0,
      transportAllowance = 0,
      otherAllowance = 0,
      pfDeduction = 0,
      taxDeduction = 0,
      otherDeduction = 0,
      effectiveFrom,
      effectiveTo,
    } = parsed.data

    // Validate employee reference based on type
    if (employeeType === 'teacher' && !teacherId) {
      return error('teacherId is required for teacher employeeType')
    }
    if (employeeType === 'staff' && !employeeId) {
      return error('employeeId is required for staff employeeType')
    }

    // Auto-calculate totalSalary and netSalary
    const totalSalary = Number(basicSalary) + Number(houseRent) + Number(medicalAllowance) + Number(transportAllowance) + Number(otherAllowance)
    const netSalary = totalSalary - Number(pfDeduction) - Number(taxDeduction) - Number(otherDeduction)

    const salaryStructure = await db.salaryStructure.create({
      data: {
        tenantId,
        employeeType,
        teacherId: employeeType === 'teacher' ? Number(teacherId) : null,
        employeeId: employeeType === 'staff' ? Number(employeeId) : null,
        basicSalary: Number(basicSalary),
        houseRent: Number(houseRent),
        medicalAllowance: Number(medicalAllowance),
        transportAllowance: Number(transportAllowance),
        otherAllowance: Number(otherAllowance),
        totalSalary,
        pfDeduction: Number(pfDeduction),
        taxDeduction: Number(taxDeduction),
        otherDeduction: Number(otherDeduction),
        netSalary,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
        createdBy: userId,
      },
      include: {
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
        entityType: 'SalaryStructure',
        entityId: salaryStructure.id,
        newValues: JSON.stringify(salaryStructure),
      },
    })

    return created(salaryStructure, 'Salary structure created successfully')
  } catch (err) {
    console.error('[SalaryStructures][POST]', err)
    return error('Failed to create salary structure', 500)
  }
}
