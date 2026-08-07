// ============================================================
// Backup Schedule API — GET/PUT
// Module 28: Backup & Restore
// Uses Settings model (key: 'backup_schedule') for schedule config
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'
import type { BackupScheduleConfig } from '@/lib/backup/constants'
import { SCHEDULE_FREQUENCIES, BACKUP_TYPES } from '@/lib/backup/constants'

const SETTINGS_KEY = 'backup_schedule'

const DEFAULT_SCHEDULE: BackupScheduleConfig = {
  enabled: false,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  type: 'full',
}

/** GET /api/backup-schedule — Get backup schedule config */
export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const setting = await db.settings.findFirst({
      where: { tenantId, key: SETTINGS_KEY },
    })

    if (!setting) {
      return NextResponse.json({ success: true, data: DEFAULT_SCHEDULE })
    }

    const config = (setting.value as BackupScheduleConfig) || DEFAULT_SCHEDULE
    return NextResponse.json({ success: true, data: { ...DEFAULT_SCHEDULE, ...config } })
  } catch (error) {
    console.error('[Backup Schedule API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** PUT /api/backup-schedule — Update backup schedule config */
export async function PUT(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const body = await req.json()

    // Validate fields
    const config: BackupScheduleConfig = {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : DEFAULT_SCHEDULE.enabled,
      frequency: (SCHEDULE_FREQUENCIES as readonly string[]).includes(body.frequency)
        ? body.frequency : DEFAULT_SCHEDULE.frequency,
      time: typeof body.time === 'string' && /^\d{2}:\d{2}$/.test(body.time)
        ? body.time : DEFAULT_SCHEDULE.time,
      retentionDays: typeof body.retentionDays === 'number' && body.retentionDays > 0
        ? Math.min(body.retentionDays, 365) : DEFAULT_SCHEDULE.retentionDays,
      type: (BACKUP_TYPES as readonly string[]).includes(body.type)
        ? body.type : DEFAULT_SCHEDULE.type,
    }

    // Upsert into Settings
    await db.settings.upsert({
      where: { tenantId_key: { tenantId, key: SETTINGS_KEY } },
      update: { value: config as unknown as Record<string, unknown> },
      create: { tenantId, key: SETTINGS_KEY, value: config as unknown as Record<string, unknown> },
    })

    return NextResponse.json({ success: true, data: config })
  } catch (error) {
    console.error('[Backup Schedule API] PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
