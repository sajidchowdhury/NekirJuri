// ============================================================
// /api/students/[id] — Get, Update, Delete
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, unauthorized, getTenantId, getUserId } from '@/lib/api-utils'
import { createAuditLog } from '@/lib/audit'

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
      if (body[bodyKey] !== undefined) data[schemaKey] = body[bodyKey]
    }

    // Date fields
    if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null
    if (body.admissionDate !== undefined) data.admissionDate = body.admissionDate ? new Date(body.admissionDate) : null

    // FK fields
    if (body.classId !== undefined) data.classId = Number(body.classId)
    if (body.sectionId !== undefined) data.sectionId = body.sectionId ? Number(body.sectionId) : null
    if (body.academicSessionId !== undefined) data.academicSessionId = Number(body.academicSessionId)

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
    if (body.guardianIds && Array.isArray(body.guardianIds)) {
      // Delete existing links and recreate
      await db.studentGuardian.deleteMany({ where: { studentId } })
      if (body.guardianIds.length > 0) {
        await db.studentGuardian.createMany({
          data: body.guardianIds.map((g: { guardianId: number; isPrimary?: boolean }, index: number) => ({
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
