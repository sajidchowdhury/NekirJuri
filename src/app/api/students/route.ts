// ============================================================
// /api/students — List & Create
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, unauthorized, paginated, getPaginationParams, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'

/** GET /api/students — List students with pagination, search, and filters */
export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const url = new URL(request.url)
    const params = getPaginationParams(url)

    // Filters
    const classId = url.searchParams.get('classId')
    const sectionId = url.searchParams.get('sectionId')
    const status = url.searchParams.get('status')

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }

    if (classId) where.classId = Number(classId)
    if (sectionId) where.sectionId = Number(sectionId)
    if (status) where.status = status

    // Search by name or registrationNo
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { registrationNo: { contains: params.search } },
        { fatherName: { contains: params.search } },
      ]
    }

    const [data, total] = await Promise.all([
      db.student.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
          academicSession: { select: { id: true, name: true } },
          studentGuardians: {
            include: {
              guardian: { select: { id: true, name: true, relationship: true, phone: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.student.count({ where }),
    ])

    return paginated(data, total, params)
  } catch (e) {
    return error(String(e))
  }
}

/** POST /api/students — Create a new student */
export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const body = await request.json()

    // Validate required fields
    if (!body.registrationNo) return error('registrationNo is required')
    if (!body.name) return error('name is required')
    if (!body.classId) return error('classId is required')
    if (!body.academicSessionId) return error('academicSessionId is required')

    // Check duplicate registrationNo within tenant
    const existing = await db.student.findFirst({
      where: { tenantId, registrationNo: body.registrationNo, deletedAt: null },
    })
    if (existing) return error('Student with this registrationNo already exists')

    const {
      guardianIds,
      registrationNo,
      admissionNo,
      name,
      nameBn,
      fatherName,
      motherName,
      dateOfBirth,
      gender,
      bloodGroup,
      nationality,
      religion,
      photoUrl,
      phone,
      email,
      address,
      city,
      state,
      country,
      postalCode,
      classId,
      sectionId,
      academicSessionId,
      admissionDate,
      previousSchool,
      rollNo,
      status,
    } = body

    const student = await db.student.create({
      data: {
        tenantId,
        registrationNo,
        admissionNo: admissionNo || null,
        name,
        nameBn: nameBn || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        nationality: nationality || 'Bangladeshi',
        religion: religion || null,
        photoUrl: photoUrl || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        postalCode: postalCode || null,
        classId: Number(classId),
        sectionId: sectionId ? Number(sectionId) : null,
        academicSessionId: Number(academicSessionId),
        admissionDate: admissionDate ? new Date(admissionDate) : null,
        previousSchool: previousSchool || null,
        rollNo: rollNo || null,
        status: status || 'active',
        createdBy: userId,
      },
      include: {
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
      },
    })

    // Handle guardian links if provided
    if (guardianIds && Array.isArray(guardianIds) && guardianIds.length > 0) {
      await db.studentGuardian.createMany({
        data: guardianIds.map((g: { guardianId: number; isPrimary?: boolean }, index: number) => ({
          studentId: student.id,
          guardianId: Number(g.guardianId ?? g),
          isPrimary: g.isPrimary ?? index === 0,
        })),
      })
    }

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'Student',
      entityId: student.id,
      newValues: student,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return created(student)
  } catch (e) {
    return error(String(e))
  }
}
