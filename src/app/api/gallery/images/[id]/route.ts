// ============================================================
// Gallery Image API — DELETE with storage cleanup
// Decrements Gallery.imageCount and Tenant.storageUsedMb
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)
    const { id } = await params
    const imageId = Number(id)

    // 1. Get the image and verify it belongs to this tenant
    const image = await db.galleryImage.findFirst({
      where: { id: imageId, tenantId: tid },
    })
    if (!image) return notFound('Image')

    const fileSizeMb = image.fileSizeKb / 1024

    // 2. Delete the image record
    await db.galleryImage.delete({ where: { id: imageId } })

    // 3. Decrement gallery imageCount (ensure it doesn't go below 0)
    const gallery = await db.gallery.findUnique({
      where: { id: image.galleryId },
      select: { imageCount: true },
    })
    if (gallery && gallery.imageCount > 0) {
      await db.gallery.update({
        where: { id: image.galleryId },
        data: { imageCount: { decrement: 1 } },
      })
    }

    // 4. Decrement tenant storageUsedMb
    if (fileSizeMb > 0) {
      const tenant = await db.tenant.findUnique({
        where: { id: tid },
        select: { storageUsedMb: true },
      })
      const currentStorage = Number(tenant?.storageUsedMb ?? 0)
      const newStorage = Math.max(0, currentStorage - fileSizeMb)
      await db.tenant.update({
        where: { id: tid },
        data: { storageUsedMb: newStorage },
      })
    }

    // 5. Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'DELETE',
        entityType: 'GalleryImage',
        entityId: imageId,
        oldValues: JSON.stringify(image),
      },
    })

    return success({ id: imageId }, 'Image deleted successfully')
  } catch (err) {
    console.error('[gallery/images/[id]][DELETE]', err)
    return error('Failed to delete image', 500)
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
    const imageId = Number(id)

    // Verify image belongs to this tenant
    const existing = await db.galleryImage.findFirst({
      where: { id: imageId, tenantId: tid },
    })
    if (!existing) return notFound('Image')

    const body = await request.json()
    const { caption, sortOrder } = body

    const updated = await db.galleryImage.update({
      where: { id: imageId },
      data: {
        ...(caption !== undefined && { caption }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'UPDATE',
        entityType: 'GalleryImage',
        entityId: imageId,
        oldValues: JSON.stringify(existing),
        newValues: JSON.stringify(updated),
      },
    })

    return success(updated, 'Image updated successfully')
  } catch (err) {
    console.error('[gallery/images/[id]][PATCH]', err)
    return error('Failed to update image', 500)
  }
}
