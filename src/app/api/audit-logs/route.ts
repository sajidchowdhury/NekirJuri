// ============================================================
// SYSTEM — Audit Logs API
// GET  /api/audit-logs    — List audit logs (paginated, filter by userId/action/entityType)
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
        { entityType: { contains: search } },
      ]
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
      }),
      db.auditLog.count({ where }),
    ])

    return paginated(logs, total, { page, limit })
  } catch (err) {
    console.error('[GET /api/audit-logs]', err)
    return error('Failed to fetch audit logs', 500)
  }
}
