// ============================================================
// SYSTEM — Permissions API
// GET  /api/permissions   — List all permissions (grouped by module)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, error, requireTenantId } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const url = new URL(request.url)
    const moduleFilter = url.searchParams.get('module')

    const where: Record<string, unknown> = {}
    if (moduleFilter) where.module = moduleFilter

    const permissions = await db.permission.findMany({
      where,
      orderBy: [{ module: 'asc' }, { slug: 'asc' }],
    })

    // Group by module for easier consumption
    const grouped: Record<string, typeof permissions> = {}
    for (const p of permissions) {
      if (!grouped[p.module]) grouped[p.module] = []
      grouped[p.module].push(p)
    }

    return success({ permissions, grouped })
  } catch (err) {
    console.error('[GET /api/permissions]', err)
    return error('Failed to fetch permissions', 500)
  }
}
