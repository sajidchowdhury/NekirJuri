// ============================================================
// Backups API — POST (trigger backup) + GET (list backups)
// Module 28: Backup & Restore
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'
import { exportTenantData } from '@/lib/backup/export'
import { DEFAULT_RETENTION_DAYS, BACKUP_TYPES, PARTIAL_SCOPES } from '@/lib/backup/constants'
import type { BackupType, TriggerSource, PartialScope } from '@/lib/backup/constants'

/** POST /api/backups — Trigger a new backup */
export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const type = (BACKUP_TYPES as readonly string[]).includes(body.type) ? body.type as BackupType : 'full'
    const triggerSource = (['manual', 'scheduled', 'auto'] as readonly string[]).includes(body.triggerSource)
      ? body.triggerSource as TriggerSource : 'manual'
    const scopes: PartialScope[] = Array.isArray(body.scopes)
      ? body.scopes.filter((s: string) => (PARTIAL_SCOPES as readonly string[]).includes(s)) as PartialScope[]
      : []
    const description = typeof body.description === 'string' ? body.description.slice(0, 200) : null
    const retentionDays = typeof body.retentionDays === 'number' ? body.retentionDays : DEFAULT_RETENTION_DAYS

    // Create BackupRecord as pending
    const backupRecord = await db.backupRecord.create({
      data: {
        tenantId,
        type,
        status: 'pending',
        triggerSource,
        description,
        expiresAt: new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000),
        createdBy: body.userId || null,
      },
    })

    // Update to running
    await db.backupRecord.update({
      where: { id: backupRecord.id },
      data: { status: 'running', startedAt: new Date() },
    })

    // Execute backup
    const result = await exportTenantData(tenantId, type, triggerSource, scopes, description || undefined)

    if (result.success) {
      // Update record to completed
      const completed = await db.backupRecord.update({
        where: { id: backupRecord.id },
        data: {
          status: 'completed',
          sizeMb: result.sizeMb,
          recordCount: result.recordCount,
          storagePath: result.storagePath,
          fileName: result.fileName,
          completedAt: new Date(),
        },
      })
      return NextResponse.json({ success: true, backup: completed })
    } else {
      // Update record to failed
      const failed = await db.backupRecord.update({
        where: { id: backupRecord.id },
        data: {
          status: 'failed',
          error: result.error,
          completedAt: new Date(),
        },
      })
      return NextResponse.json({ success: false, backup: failed, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('[Backups API] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** GET /api/backups — List backup records */
export async function GET(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { tenantId }
    if (status) where.status = status
    if (type) where.type = type

    const [records, total] = await Promise.all([
      db.backupRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.backupRecord.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: records,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('[Backups API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
