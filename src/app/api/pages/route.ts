// ============================================================
// CMS — Website Pages API
// GET  /api/pages        — List pages (paginated, filter by isPublished)
// POST /api/pages        — Create page
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
  requireTenantId,
} from '@/lib/api-utils'
import { websitePageCreateSchema, formatZodError } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const isPublished = url.searchParams.get('isPublished')

    const where: Record<string, unknown> = { tenantId, deletedAt: null }
    if (isPublished !== null) where.isPublished = isPublished === 'true'
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ]
    }

    const [pages, total] = await Promise.all([
      db.websitePage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { sortOrder: 'asc' },
      }),
      db.websitePage.count({ where }),
    ])

    return paginated(pages, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/pages]', err)
    return error('Failed to fetch pages', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const userId = request.headers.get('x-user-id')
    const body = await request.json()

    // Zod validation
    const parsed = websitePageCreateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    const { title, slug, content, metaTitle, metaDescription, featuredImageUrl, isPublished, sortOrder } = parsed.data

    // Check slug uniqueness within tenant
    const existing = await db.websitePage.findUnique({
      where: { tenantId_slug: { tenantId, slug } },
    })
    if (existing) {
      return error('A page with this slug already exists')
    }

    const page = await db.websitePage.create({
      data: {
        tenantId,
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        featuredImageUrl,
        isPublished: isPublished ?? false,
        publishedAt: isPublished ? new Date() : null,
        sortOrder: sortOrder ?? 0,
        createdBy: userId ? Number(userId) : null,
      },
    })

    return created(page)
  } catch (err) {
    console.error('[POST /api/pages]', err)
    return error('Failed to create page', 500)
  }
}
