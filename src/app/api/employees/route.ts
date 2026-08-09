// ============================================================
// /api/employees — List & Create
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, unauthorized, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'
import { employeeCreateSchema, formatZodError } from '@/lib/validations'

/** GET /api/employees — List employees with pagination, search, and filters */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    // Filters
    const department = url.searchParams.get('department')
    const designation = url.searchParams.get('designation')
    const status = url.searchParams.get('status')

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

    if (department) where.department = department
    if (designation) where.designation = designation
    if (status) where.status = status

    // Search by name or employeeIdNo
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { employeeIdNo: { contains: params.search } },
        { phone: { contains: params.search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.employee.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.employee.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/employees — Create a new employee */
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const body = await request.json()

    // Validate with Zod
    const parsed = employeeCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Check duplicate employeeIdNo within tenant
    const existing = await db.employee.findFirst({
      where: { tenantId, employeeIdNo: parsed.data.employeeIdNo, deletedAt: null },
    })
    if (existing) return error('Employee with this employeeIdNo already exists')

    const employee = await db.employee.create({
      data: {
        tenantId,
        employeeIdNo: parsed.data.employeeIdNo,
        name: parsed.data.name,
        nameBn: parsed.data.nameBn || null,
        fatherName: parsed.data.fatherName || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        gender: parsed.data.gender || null,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        designation: parsed.data.designation || null,
        department: parsed.data.department || null,
        joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : null,
        leavingDate: parsed.data.leavingDate ? new Date(parsed.data.leavingDate) : null,
        photoUrl: parsed.data.photoUrl || null,
        status: parsed.data.status || 'active',
        createdBy: userId,
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'Employee',
      entityId: employee.id,
      newValues: employee,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return created(employee)
  } catch (e) {
    return error(String(e))
  }
}
