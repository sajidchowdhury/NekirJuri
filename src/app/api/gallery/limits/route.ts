// ============================================================
// Gallery Limits API — GET current usage vs subscription limits
// Returns: albums, images per album, storage usage, and all limits
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  success,
  error,
  requireTenantId,
} from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const tid = requireTenantId(request)
    if (typeof tid !== 'number') return tid

    // Get tenant's active subscription with plan limits
    const subscription = await db.subscription.findFirst({
      where: { tenantId: tid, status: { notIn: ['cancelled', 'terminated'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    })

    const maxAlbums = subscription?.plan.maxAlbums ?? 5
    const maxImagesPerAlbum = subscription?.plan.maxImagesPerAlbum ?? 20
    const maxImageSizeMb = subscription?.plan.maxImageSizeMb ?? 2
    const maxStorageMb = subscription?.plan.maxStorageMb ?? 100
    const planName = subscription?.plan.name ?? 'Free'
    const planSlug = subscription?.plan.slug ?? 'free'

    // Current usage
    const [albumCount, tenant] = await Promise.all([
      db.gallery.count({ where: { tenantId: tid } }),
      db.tenant.findUnique({ where: { id: tid }, select: { storageUsedMb: true } }),
    ])

    const storageUsedMb = Number(tenant?.storageUsedMb ?? 0)

    // Get per-album image counts
    const galleries = await db.gallery.findMany({
      where: { tenantId: tid },
      select: { id: true, title: true, imageCount: true },
      orderBy: { createdAt: 'desc' },
    })

    return success({
      limits: {
        maxAlbums,
        maxImagesPerAlbum,
        maxImageSizeMb,
        maxStorageMb,
      },
      usage: {
        albumCount,
        storageUsedMb,
        albums: galleries.map(g => ({
          id: g.id,
          title: g.title,
          imageCount: g.imageCount,
        })),
      },
      plan: {
        name: planName,
        slug: planSlug,
      },
      // Computed flags for easy frontend checks
      canCreateAlbum: albumCount < maxAlbums,
      isStorageFull: storageUsedMb >= maxStorageMb,
      storagePercentage: Math.min(100, Math.round((storageUsedMb / maxStorageMb) * 100)),
    })
  } catch (err) {
    console.error('[gallery/limits][GET]', err)
    return error('Failed to fetch gallery limits', 500)
  }
}
