// ============================================================
// SYSTEM — Notifications API
// GET  /api/notifications  — List notifications for current user (filter by isRead)
// POST /api/notifications  — Create notification
// PUT  /api/notifications  — Mark as read (accept {id} or {markAllRead: true})
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
  getUserId,
} from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const userId = getUserId(request)
    const { page, limit, sortBy, sortOrder } = getPaginationParams(request.url)
    const url = new URL(request.url)
    const isRead = url.searchParams.get('isRead')

    const where: Record<string, unknown> = { tenantId }
    if (userId) where.userId = userId
    if (isRead !== null) where.isRead = isRead === 'true'

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.notification.count({ where }),
    ])

    return paginated(notifications, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/notifications]', err)
    return error('Failed to fetch notifications', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const body = await request.json()
    const { userId, title, message, type, link } = body

    if (!userId || !title || !type) {
      return error('userId, title, and type are required')
    }

    const notification = await db.notification.create({
      data: {
        tenantId,
        userId,
        title,
        message,
        type,
        link,
      },
    })

    return created(notification)
  } catch (err) {
    console.error('[POST /api/notifications]', err)
    return error('Failed to create notification', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const body = await request.json()
    const { id, markAllRead } = body as { id?: number; markAllRead?: boolean }

    if (markAllRead) {
      // Mark all notifications as read for current user
      const userId = getUserId(request)
      if (!userId) return error('User context required for markAllRead')

      const result = await db.notification.updateMany({
        where: { tenantId, userId, isRead: false },
        data: { isRead: true },
      })

      return success({ count: result.count }, `${result.count} notifications marked as read`)
    }

    if (id) {
      // Mark single notification as read
      const notification = await db.notification.findFirst({
        where: { id: Number(id), tenantId },
      })
      if (!notification) return error('Notification not found', 404)

      const updated = await db.notification.update({
        where: { id: Number(id) },
        data: { isRead: true },
      })

      return success(updated)
    }

    return error('Provide {id} to mark one or {markAllRead: true} to mark all')
  } catch (err) {
    console.error('[PUT /api/notifications]', err)
    return error('Failed to update notification', 500)
  }
}
