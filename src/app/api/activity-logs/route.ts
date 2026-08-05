// ============================================================
// SYSTEM — Activity Logs API
// GET  /api/activity-logs  — List activity logs (paginated, filter by userId/action/entityType)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
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
    const userId = url.searchParams.get('userId')
    const action = url.searchParams.get('action')
    const entityType = url.searchParams.get('entityType')

    const where: Record<string, unknown> = { tenantId }
    if (userId) where.userId = Number(userId)
    if (action) where.action = action
    if (entityType) where.entityType = entityType
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.activityLog.count({ where }),
    ])

    return paginated(logs, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/activity-logs]', err)
    return error('Failed to fetch activity logs', 500)
  }
}
