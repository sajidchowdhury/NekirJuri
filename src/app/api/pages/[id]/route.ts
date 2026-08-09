// ============================================================
// CMS — Website Page by ID API
// GET    /api/pages/:id   — Get single page
// PUT    /api/pages/:id   — Update page
// DELETE /api/pages/:id   — Delete page
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, requireTenantId } from '@/lib/api-utils'
import { websitePageUpdateSchema, formatZodError } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { id } = await params
    const page = await db.websitePage.findFirst({
      where: { id: Number(id), tenantId },
    })

    if (!page) return notFound('Page')
    return success(page)
  } catch (err) {
    console.error('[GET /api/pages/:id]', err)
    return error('Failed to fetch page', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { id } = await params
    const existing = await db.websitePage.findFirst({
      where: { id: Number(id), tenantId },
    })
    if (!existing) return notFound('Page')

    const userId = request.headers.get('x-user-id')
    const body = await request.json()

    // Zod validation
    const parsed = websitePageUpdateSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    // If slug is being changed, check uniqueness
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugConflict = await db.websitePage.findUnique({
        where: { tenantId_slug: { tenantId, slug: parsed.data.slug } },
      })
      if (slugConflict) return error('A page with this slug already exists')
    }

    // If publishing for the first time, set publishedAt
    const isPublishing = parsed.data.isPublished === true && !existing.isPublished

    const page = await db.websitePage.update({
      where: { id: Number(id) },
      data: {
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.slug !== undefined && { slug: parsed.data.slug }),
        ...(parsed.data.content !== undefined && { content: parsed.data.content }),
        ...(parsed.data.metaTitle !== undefined && { metaTitle: parsed.data.metaTitle }),
        ...(parsed.data.metaDescription !== undefined && { metaDescription: parsed.data.metaDescription }),
        ...(parsed.data.featuredImageUrl !== undefined && { featuredImageUrl: parsed.data.featuredImageUrl }),
        ...(parsed.data.isPublished !== undefined && { isPublished: parsed.data.isPublished }),
        ...(isPublishing && { publishedAt: new Date() }),
        ...(parsed.data.sortOrder !== undefined && { sortOrder: parsed.data.sortOrder }),
        updatedBy: userId ? Number(userId) : null,
      },
    })

    return success(page)
  } catch (err) {
    console.error('[PUT /api/pages/:id]', err)
    return error('Failed to update page', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { id } = await params
    const existing = await db.websitePage.findFirst({
      where: { id: Number(id), tenantId },
    })
    if (!existing) return notFound('Page')

    await db.websitePage.delete({ where: { id: Number(id) } })

    return success(null, 'Page deleted successfully')
  } catch (err) {
    console.error('[DELETE /api/pages/:id]', err)
    return error('Failed to delete page', 500)
  }
}
