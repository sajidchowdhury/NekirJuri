// ============================================================
// Gallery Album API — PATCH (update) / DELETE (with storage cleanup)
// DELETE: Removes all images, decrements Tenant.storageUsedMb
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  requireTenantId,
  getUserId,
} from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const { id } = await params

    const gallery = await db.gallery.findFirst({
      where: { id: Number(id), tenantId: tid },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!gallery) return notFound('Gallery/Album')

    return success(gallery)
  } catch (err) {
    console.error('[galleries/[id]][GET]', err)
    return error('Failed to fetch gallery', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const galleryId = Number(id)

    // Verify gallery belongs to this tenant
    const existing = await db.gallery.findFirst({
      where: { id: galleryId, tenantId: tid },
    })
    if (!existing) return notFound('Gallery/Album')

    const body = await request.json()
    const { title, description, coverImageUrl, isPublished } = body

    const updated = await db.gallery.update({
      where: { id: galleryId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(isPublished !== undefined && { isPublished }),
      },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'UPDATE',
        entityType: 'Gallery',
        entityId: galleryId,
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(updated),
      },
    })

    return success(updated, 'Album updated successfully')
  } catch (err) {
    console.error('[galleries/[id]][PATCH]', err)
    return error('Failed to update album', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const galleryId = Number(id)

    // 1. Verify gallery belongs to this tenant
    const gallery = await db.gallery.findFirst({
      where: { id: galleryId, tenantId: tid },
      include: { images: true },
    })
    if (!gallery) return notFound('Gallery/Album')

    // 2. Calculate total storage to free
    const totalSizeKb = gallery.images.reduce((sum, img) => sum + img.fileSizeKb, 0)
    const totalSizeMb = totalSizeKb / 1024

    // 3. Delete all images in the gallery
    await db.galleryImage.deleteMany({
      where: { galleryId, tenantId: tid },
    })

    // 4. Delete the gallery itself
    await db.gallery.delete({
      where: { id: galleryId },
    })

    // 5. Decrement tenant storageUsedMb
    if (totalSizeMb > 0) {
      const tenant = await db.tenant.findUnique({
        where: { id: tid },
        select: { storageUsedMb: true },
      })
      const currentStorage = Number(tenant?.storageUsedMb ?? 0)
      const newStorage = Math.max(0, currentStorage - totalSizeMb)
      await db.tenant.update({
        where: { id: tid },
        data: { storageUsedMb: newStorage },
      })
    }

    // 6. Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'DELETE',
        entityType: 'Gallery',
        entityId: galleryId,
        oldValues: JSON.stringify({
          title: gallery.title,
          imageCount: gallery.imageCount,
          totalSizeMb,
        }),
      },
    })

    return success({ id: galleryId }, 'Album deleted successfully')
  } catch (err) {
    console.error('[galleries/[id]][DELETE]', err)
    return error('Failed to delete album', 500)
  }
}
