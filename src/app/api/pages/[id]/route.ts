// ============================================================
// CMS — Website Page by ID API
// GET    /api/pages/:id   — Get single page
// PUT    /api/pages/:id   — Update page
// DELETE /api/pages/:id   — Delete page
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, notFound, requireTenantId } from '@/lib/api-utils'

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
    const userId = request.headers.get('x-user-id')
    const body = await request.json()

    const existing = await db.websitePage.findFirst({
      where: { id: Number(id), tenantId },
    })
    if (!existing) return notFound('Page')

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugConflict = await db.websitePage.findUnique({
        where: { tenantId_slug: { tenantId, slug: body.slug } },
      })
      if (slugConflict) return error('A page with this slug already exists')
    }

    // If publishing for the first time, set publishedAt
    const isPublishing = body.isPublished === true && !existing.isPublished

    const page = await db.websitePage.update({
      where: { id: Number(id) },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
        ...(body.featuredImageUrl !== undefined && { featuredImageUrl: body.featuredImageUrl }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(isPublishing && { publishedAt: new Date() }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
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
