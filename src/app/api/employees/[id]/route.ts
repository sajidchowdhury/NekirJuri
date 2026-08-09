// ============================================================
// /api/employees/[id] — Get, Update, Delete
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, unauthorized, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'
import { employeeUpdateSchema, formatZodError } from '@/lib/validations'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/employees/:id — Get single employee with salary structures */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const { id } = await context.params
    const employeeId = Number(id)

    const employee = await db.employee.findFirst({
      where: { id: employeeId, tenantId, deletedAt: null },
      include: {
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    })

    if (!employee) return notFound('Employee')

    return success(employee)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/employees/:id — Update employee (partial update) */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const employeeId = Number(id)

    const existing = await db.employee.findFirst({
      where: { id: employeeId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Employee')

    const body = await request.json()

    // Validate with Zod
    const parsed = employeeUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Build update object with only provided fields
    const data: Record<string, unknown> = { updatedBy: userId }

    const fieldMap: Record<string, string> = {
      employeeIdNo: 'employeeIdNo',
      name: 'name',
      nameBn: 'nameBn',
      fatherName: 'fatherName',
      gender: 'gender',
      phone: 'phone',
      email: 'email',
      address: 'address',
      designation: 'designation',
      department: 'department',
      photoUrl: 'photoUrl',
      status: 'status',
    }

    for (const [bodyKey, schemaKey] of Object.entries(fieldMap)) {
      if (parsed.data[bodyKey as keyof typeof parsed.data] !== undefined) data[schemaKey] = parsed.data[bodyKey as keyof typeof parsed.data]
    }

    // Date fields
    if (parsed.data.dateOfBirth !== undefined) data.dateOfBirth = parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null
    if (parsed.data.joiningDate !== undefined) data.joiningDate = parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : null
    if (parsed.data.leavingDate !== undefined) data.leavingDate = parsed.data.leavingDate ? new Date(parsed.data.leavingDate) : null

    const employee = await db.employee.update({
      where: { id: employeeId },
      data,
      include: {
        salaryStructures: {
          where: { isActive: true },
          orderBy: { effectiveFrom: 'desc' },
        },
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'Employee',
      entityId: employeeId,
      oldValues: existing,
      newValues: employee,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(employee)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/employees/:id — Soft delete employee */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const employeeId = Number(id)

    const existing = await db.employee.findFirst({
      where: { id: employeeId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Employee')

    const employee = await db.employee.update({
      where: { id: employeeId },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: userId,
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'DELETE',
      entityType: 'Employee',
      entityId: employeeId,
      oldValues: existing,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(employee, 'Employee deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
