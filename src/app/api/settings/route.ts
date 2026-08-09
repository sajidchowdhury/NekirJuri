// ============================================================
// SYSTEM — Settings API
// GET  /api/settings      — Get all settings for tenant (key-value pairs)
// POST /api/settings      — Upsert settings (accept array of {key, value})
// PUT  /api/settings      — Upsert settings (alias for POST)
// ============================================================

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { success, created, error, requireTenantId } from '@/lib/api-utils'
import { settingsUpsertSchema, formatZodError } from '@/lib/validations'

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

    // Zod validation
    const parsed = settingsUpsertSchema.safeParse(body)
    if (!parsed.success) return error(formatZodError(parsed.error), 400)

    const { settings } = parsed.data

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
