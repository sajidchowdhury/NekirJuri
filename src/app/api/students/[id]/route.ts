// ============================================================
// /api/students/[id] — Get, Update, Delete
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, unauthorized, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'
import { studentUpdateSchema, formatZodError } from '@/lib/validations'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/students/:id — Get single student with relations */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const { id } = await context.params
    const studentId = Number(id)

    const student = await db.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
      include: {
        class: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
        studentGuardians: {
          include: {
            guardian: true,
          },
        },
        feeInvoices: {
          where: { deletedAt: null },
          include: {
            invoiceItems: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!student) return notFound('Student')

    return success(student)
  } catch (e) {
    return error(String(e))
  }
}

/** PUT /api/students/:id — Update student (partial update) */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const studentId = Number(id)

    const existing = await db.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Student')

    const body = await request.json()

    // Validate with Zod
    const parsed = studentUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    // Build update object with only provided fields
    const data: Record<string, unknown> = { updatedBy: userId }

    const fieldMap: Record<string, string> = {
      registrationNo: 'registrationNo',
      admissionNo: 'admissionNo',
      name: 'name',
      nameBn: 'nameBn',
      fatherName: 'fatherName',
      motherName: 'motherName',
      gender: 'gender',
      bloodGroup: 'bloodGroup',
      nationality: 'nationality',
      religion: 'religion',
      photoUrl: 'photoUrl',
      phone: 'phone',
      email: 'email',
      address: 'address',
      city: 'city',
      state: 'state',
      country: 'country',
      postalCode: 'postalCode',
      previousSchool: 'previousSchool',
      rollNo: 'rollNo',
      status: 'status',
    }

    for (const [bodyKey, schemaKey] of Object.entries(fieldMap)) {
      if (parsed.data[bodyKey as keyof typeof parsed.data] !== undefined) data[schemaKey] = parsed.data[bodyKey as keyof typeof parsed.data]
    }

    // Date fields
    if (parsed.data.dateOfBirth !== undefined) data.dateOfBirth = parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null
    if (parsed.data.admissionDate !== undefined) data.admissionDate = parsed.data.admissionDate ? new Date(parsed.data.admissionDate) : null

    // FK fields
    if (parsed.data.classId !== undefined) data.classId = Number(parsed.data.classId)
    if (parsed.data.sectionId !== undefined) data.sectionId = parsed.data.sectionId ? Number(parsed.data.sectionId) : null
    if (parsed.data.academicSessionId !== undefined) data.academicSessionId = Number(parsed.data.academicSessionId)

    const student = await db.student.update({
      where: { id: studentId },
      data,
      include: {
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
      },
    })

    // Handle guardian links update if provided
    if (parsed.data.guardianIds && Array.isArray(parsed.data.guardianIds)) {
      // Delete existing links and recreate
      await db.studentGuardian.deleteMany({ where: { studentId } })
      if (parsed.data.guardianIds.length > 0) {
        await db.studentGuardian.createMany({
          data: parsed.data.guardianIds.map((g: { guardianId: number; isPrimary?: boolean }, index: number) => ({
            studentId,
            guardianId: Number(g.guardianId ?? g),
            isPrimary: g.isPrimary ?? index === 0,
          })),
        })
      }
    }

    // Audit log
    createAuditLog({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'Student',
      entityId: studentId,
      oldValues: existing,
      newValues: student,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(student)
  } catch (e) {
    return error(String(e))
  }
}

/** DELETE /api/students/:id — Soft delete student */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(request)
    if (!tenantId) return unauthorized()

    const userId = getUserId(request)
    const { id } = await context.params
    const studentId = Number(id)

    const existing = await db.student.findFirst({
      where: { id: studentId, tenantId, deletedAt: null },
    })
    if (!existing) return notFound('Student')

    const student = await db.student.update({
      where: { id: studentId },
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
      entityType: 'Student',
      entityId: studentId,
      oldValues: existing,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return success(student, 'Student deleted successfully')
  } catch (e) {
    return error(String(e))
  }
}
