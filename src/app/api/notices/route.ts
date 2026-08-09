// ============================================================
// CMS — Notices API
// GET  /api/notices       — List notices (paginated, filter by noticeType/isPublished)
// POST /api/notices       — Create notice
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  created,
  error,
  paginated,
  getPaginationParams,
  requireTenantId,
} from '@/lib/api-utils'
import { noticeCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const noticeType = url.searchParams.get('noticeType')
    const isPublished = url.searchParams.get('isPublished')

    const where: Record<string, unknown> = { tenantId }
    if (noticeType) where.noticeType = noticeType
    if (isPublished !== null) where.isPublished = isPublished === 'true'
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ]
    }

    const [notices, total] = await Promise.all([
      db.notice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.notice.count({ where }),
    ])

    return paginated(notices, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/notices]', err)
    return error('Failed to fetch notices', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const userId = request.headers.get('x-user-id')
    const body = await request.json()

    // Zod validation
    const parsed = noticeCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    const { title, content, noticeType, targetAudience, attachmentUrl, isPublished } = parsed.data

    const notice = await db.notice.create({
      data: {
        tenantId,
        title,
        content,
        noticeType,
        targetAudience,
        attachmentUrl,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        createdBy: userId ? Number(userId) : null,
      },
    })

    return created(notice)
  } catch (err) {
    console.error('[POST /api/notices]', err)
    return error('Failed to create notice', 500)
  }
}
