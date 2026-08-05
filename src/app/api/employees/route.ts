// ============================================================
// /api/employees — List & Create
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, unauthorized, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'

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

    // Validate required fields
    if (!body.employeeIdNo) return error('employeeIdNo is required')
    if (!body.name) return error('name is required')
    if (!body.phone) return error('phone is required')

    // Check duplicate employeeIdNo within tenant
    const existing = await db.employee.findFirst({
      where: { tenantId, employeeIdNo: body.employeeIdNo, deletedAt: null },
    })
    if (existing) return error('Employee with this employeeIdNo already exists')

    const employee = await db.employee.create({
      data: {
        tenantId,
        employeeIdNo: body.employeeIdNo,
        name: body.name,
        nameBn: body.nameBn || null,
        fatherName: body.fatherName || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        designation: body.designation || null,
        department: body.department || null,
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : null,
        leavingDate: body.leavingDate ? new Date(body.leavingDate) : null,
        photoUrl: body.photoUrl || null,
        status: body.status || 'active',
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
