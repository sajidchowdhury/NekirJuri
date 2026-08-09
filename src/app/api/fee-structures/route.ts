// ============================================================
// Fee Structures API — GET (list with filters), POST (create)
// Maps FeeCategory → Class → AcademicSession
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  paginated,
  getPaginationParams,
  getTenantId,
  getUserId,
  requireTenantId,
} from '@/lib/api-utils'
import { feeStructureCreateSchema, formatZodError } from '@/lib/validations'

// --- GET: List fee structures with pagination, search & filters ---
export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const classId = url.searchParams.get('classId')
    const academicSessionId = url.searchParams.get('academicSessionId')
    const feeCategoryId = url.searchParams.get('feeCategoryId')

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId: tid }
    if (classId) where.classId = Number(classId)
    if (academicSessionId) where.academicSessionId = Number(academicSessionId)
    if (feeCategoryId) where.feeCategoryId = Number(feeCategoryId)

    if (search) {
      // Search by fee category name via relation
      where.feeCategory = { name: { contains: search } }
    }

    const [data, total] = await Promise.all([
      db.feeStructure.findMany({
        where,
        skip,
        take: limit,
        orderBy: sortBy
          ? { [sortBy]: sortOrder }
          : { createdAt: 'desc' },
        include: {
          feeCategory: { select: { id: true, name: true, code: true } },
          class: { select: { id: true, name: true } },
          academicSession: { select: { id: true, name: true } },
        },
      }),
      db.feeStructure.count({ where }),
    ])

    return paginated(data, total, { page, limit })
  } catch (err) {
    console.error('[fee-structures][GET]', err)
    return error('Failed to fetch fee structures', 500)
  }
}

// --- POST: Create fee structure ---
export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()

    // Validate with Zod
    const parsed = feeStructureCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error))

    const { classId, feeCategoryId, academicSessionId, amount, isMandatory } = parsed.data

    // Check unique constraint (tenantId + classId + feeCategoryId + academicSessionId)
    const existing = await db.feeStructure.findFirst({
      where: {
        tenantId: tid,
        classId: Number(classId),
        feeCategoryId: Number(feeCategoryId),
        academicSessionId: Number(academicSessionId),
      },
    })
    if (existing) return error('Fee structure already exists for this class, fee, and session')

    const record = await db.feeStructure.create({
      data: {
        tenantId: tid,
        classId: Number(classId),
        feeCategoryId: Number(feeCategoryId),
        academicSessionId: Number(academicSessionId),
        amount: Number(amount),
        isMandatory: isMandatory ?? true,
      },
      include: {
        feeCategory: { select: { id: true, name: true, code: true } },
        class: { select: { id: true, name: true } },
        academicSession: { select: { id: true, name: true } },
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'FeeStructure',
        entityId: record.id,
        newValues: JSON.stringify(record),
      },
    })

    return created(record)
  } catch (err) {
    console.error('[fee-structures][POST]', err)
    return error('Failed to create fee structure', 500)
  }
}
