// ============================================================
// /api/teachers — List & Create
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, unauthorized, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'
import { teacherCreateSchema, formatZodError } from '@/lib/validations'

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

    // Validate with Zod
    const parsed = teacherCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Check duplicate employeeIdNo within tenant
    const existing = await db.teacher.findFirst({
      where: { tenantId, employeeIdNo: parsed.data.employeeIdNo, deletedAt: null },
    })
    if (existing) return error('Teacher with this employeeIdNo already exists')

    const teacher = await db.teacher.create({
      data: {
        tenantId,
        employeeIdNo: parsed.data.employeeIdNo,
        name: parsed.data.name,
        nameBn: parsed.data.nameBn || null,
        fatherName: parsed.data.fatherName || null,
        motherName: parsed.data.motherName || null,
        dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
        gender: parsed.data.gender || null,
        bloodGroup: parsed.data.bloodGroup || null,
        nationality: parsed.data.nationality || null,
        religion: parsed.data.religion || null,
        photoUrl: parsed.data.photoUrl || null,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        address: parsed.data.address || null,
        city: parsed.data.city || null,
        qualification: parsed.data.qualification || null,
        specialization: parsed.data.specialization || null,
        joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : null,
        leavingDate: parsed.data.leavingDate ? new Date(parsed.data.leavingDate) : null,
        status: parsed.data.status || 'active',
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
