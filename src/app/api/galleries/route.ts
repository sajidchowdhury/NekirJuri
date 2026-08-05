// ============================================================
// CMS — Galleries API
// GET  /api/galleries     — List galleries with images (paginated)
// POST /api/galleries     — Create gallery
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

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const { page, limit, search, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const isPublished = url.searchParams.get('isPublished')

    const where: Record<string, unknown> = { tenantId }
    if (isPublished !== null) where.isPublished = isPublished === 'true'
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [galleries, total] = await Promise.all([
      db.gallery.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.gallery.count({ where }),
    ])

    return paginated(galleries, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/galleries]', err)
    return error('Failed to fetch galleries', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const userId = request.headers.get('x-user-id')
    const body = await request.json()
    const { title, description, coverImageUrl, isPublished, images } = body

    if (!title) {
      return error('title is required')
    }

    const gallery = await db.gallery.create({
      data: {
        tenantId,
        title,
        description,
        coverImageUrl,
        isPublished: isPublished ?? false,
        createdBy: userId ? Number(userId) : null,
        ...(images &&
          Array.isArray(images) &&
          images.length > 0 && {
            images: {
              create: images.map(
                (img: { imageUrl: string; caption?: string; sortOrder?: number }, idx: number) => ({
                  tenantId,
                  imageUrl: img.imageUrl,
                  caption: img.caption,
                  sortOrder: img.sortOrder ?? idx,
                })
              ),
            },
          }),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
    })

    return created(gallery)
  } catch (err) {
    console.error('[POST /api/galleries]', err)
    return error('Failed to create gallery', 500)
  }
}
