// ============================================================
// SYSTEM — Settings API
// GET  /api/settings      — Get all settings for tenant (key-value pairs)
// POST /api/settings      — Upsert settings (accept array of {key, value})
// PUT  /api/settings      — Upsert settings (alias for POST)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, requireTenantId } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const settings = await db.settings.findMany({
      where: { tenantId },
      orderBy: { key: 'asc' },
    })

    // Return as key-value map for easy consumption
    const settingsMap: Record<string, string | null> = {}
    for (const s of settings) {
      settingsMap[s.key] = s.value
    }

    return success({ settings: settingsMap, raw: settings })
  } catch (err) {
    console.error('[GET /api/settings]', err)
    return error('Failed to fetch settings', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = requireTenantId(request)
    if (typeof tenantId !== 'number') return tenantId

    const body = await request.json()
    const { settings } = body as { settings: Array<{ key: string; value?: string }> }

    if (!settings || !Array.isArray(settings) || settings.length === 0) {
      return error('settings array with {key, value} objects is required')
    }

    // Validate all items have keys
    for (const item of settings) {
      if (!item.key) return error('Each setting must have a key')
    }

    // Upsert each setting
    const results = await db.$transaction(
      settings.map((item) =>
        db.settings.upsert({
          where: {
            tenantId_key: { tenantId, key: item.key },
          },
          update: { value: item.value ?? null },
          create: {
            tenantId,
            key: item.key,
            value: item.value ?? null,
          },
        })
      )
    )

    return created(results, 'Settings upserted successfully')
  } catch (err) {
    console.error('[POST /api/settings]', err)
    return error('Failed to upsert settings', 500)
  }
}

export async function PUT(request: NextRequest) {
  // PUT is an alias for POST (upsert pattern)
  return POST(request)
}
