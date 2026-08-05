// ============================================================
// /api/teachers — List & Create
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, unauthorized, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'

/** GET /api/teachers — List teachers with pagination, search, and status filter */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    // Filters
    const status = url.searchParams.get('status')

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

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
      db.teacher.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          classesAsTeacher: { select: { id: true, name: true, code: true } },
          sectionsAsInCharge: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.teacher.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/teachers — Create a new teacher */
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
    const existing = await db.teacher.findFirst({
      where: { tenantId, employeeIdNo: body.employeeIdNo, deletedAt: null },
    })
    if (existing) return error('Teacher with this employeeIdNo already exists')

    const teacher = await db.teacher.create({
      data: {
        tenantId,
        employeeIdNo: body.employeeIdNo,
        name: body.name,
        nameBn: body.nameBn || null,
        fatherName: body.fatherName || null,
        motherName: body.motherName || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        bloodGroup: body.bloodGroup || null,
        nationality: body.nationality || null,
        religion: body.religion || null,
        photoUrl: body.photoUrl || null,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        city: body.city || null,
        qualification: body.qualification || null,
        specialization: body.specialization || null,
        joiningDate: body.joiningDate ? new Date(body.joiningDate) : null,
        leavingDate: body.leavingDate ? new Date(body.leavingDate) : null,
        status: body.status || 'active',
        createdBy: userId,
      },
    })

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'Teacher',
      entityId: teacher.id,
      newValues: teacher,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return created(teacher)
  } catch (e) {
    return error(String(e))
  }
}
