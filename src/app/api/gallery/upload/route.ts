// ============================================================
// Gallery Upload API — POST with subscription limit enforcement
// Checks: maxImagesPerAlbum, maxImageSizeMb, maxStorageMb
// Returns 413 with limit info when exceeded
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  notFound,
  requireTenantId,
  getUserId,
} from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid
    const userId = getUserId(request)

    const body = await request.json()
    const { galleryId, imageUrl, caption, fileSizeKb } = body

    if (!galleryId || !imageUrl) {
      return error('galleryId and imageUrl are required')
    }

    // 1. Get the gallery and verify it belongs to this tenant
    const gallery = await db.gallery.findFirst({
      where: { id: Number(galleryId), tenantId: tid },
    })
    if (!gallery) return notFound('Gallery/Album')

    // 2. Get tenant's active subscription with plan limits
    const subscription = await db.subscription.findFirst({
      where: { tenantId: tid, status: { notIn: ['cancelled', 'terminated'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    // If no subscription, use defaults (free tier)
    const maxImagesPerAlbum = subscription?.plan.maxImagesPerAlbum ?? 20
    const maxImageSizeMb = subscription?.plan.maxImageSizeMb ?? 2
    const maxStorageMb = subscription?.plan.maxStorageMb ?? 100

    // 3. Check: images per album limit
    const currentImageCount = gallery.imageCount
    if (currentImageCount >= maxImagesPerAlbum) {
      return NextResponse.json(
        {
          success: false,
          error: `Image limit reached for this album (${currentImageCount}/${maxImagesPerAlbum})`,
          limitType: 'maxImagesPerAlbum',
          current: currentImageCount,
          max: maxImagesPerAlbum,
        },
        { status: 413 }
      )
    }

    // 4. Check: image size limit
    const fileSizeMb = (fileSizeKb ?? 0) / 1024
    if (fileSizeMb > maxImageSizeMb) {
      return NextResponse.json(
        {
          success: false,
          error: `Image size (${fileSizeMb.toFixed(1)}MB) exceeds limit (${maxImageSizeMb}MB)`,
          limitType: 'maxImageSizeMb',
          current: fileSizeMb,
          max: maxImageSizeMb,
        },
        { status: 413 }
      )
    }

    // 5. Check: total storage limit
    const tenant = await db.tenant.findUnique({ where: { id: tid } })
    const currentStorageMb = Number(tenant?.storageUsedMb ?? 0)
    const newFileSizeMb = fileSizeKb ? fileSizeKb / 1024 : 0
    if (currentStorageMb + newFileSizeMb > maxStorageMb) {
      return NextResponse.json(
        {
          success: false,
          error: `Storage limit reached (${currentStorageMb.toFixed(0)}/${maxStorageMb}MB)`,
          limitType: 'maxStorageMb',
          current: currentStorageMb,
          max: maxStorageMb,
        },
        { status: 413 }
      )
    }

    // 6. All checks passed — create the image
    const image = await db.galleryImage.create({
      data: {
        tenantId: tid,
        galleryId: Number(galleryId),
        imageUrl,
        caption: caption || null,
        fileSizeKb: fileSizeKb ?? 0,
        sortOrder: currentImageCount, // append at end
      },
    })

    // 7. Update gallery imageCount
    await db.gallery.update({
      where: { id: Number(galleryId) },
      data: { imageCount: { increment: 1 } },
    })

    // 8. Update tenant storageUsedMb
    if (newFileSizeMb > 0) {
      await db.tenant.update({
        where: { id: tid },
        data: { storageUsedMb: { increment: newFileSizeMb } },
      })
    }

    // 9. Audit log
    await db.auditLog.create({
      data: {
        tenantId: tid,
        userId,
        action: 'CREATE',
        entityType: 'GalleryImage',
        entityId: image.id,
        newValues: JSON.stringify(image),
      },
    })

    return success(image, 'Image uploaded successfully')
  } catch (err) {
    console.error('[gallery/upload][POST]', err)
    return error('Failed to upload image', 500)
  }
}
