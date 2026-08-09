// ============================================================
// Restore API — POST (restore from backup)
// Module 28: Backup & Restore
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'
import { restoreTenantData } from '@/lib/backup/import'
import { exportTenantData } from '@/lib/backup/export'

/** POST /api/restore — Restore tenant data from a backup */
export async function POST(req: NextRequest) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const body = await req.json()
    const { backupId, confirmOverwrite } = body

    if (!backupId || typeof backupId !== 'number') {
      return NextResponse.json({ error: 'backupId is required' }, { status: 400 })
    }

    if (!confirmOverwrite) {
      return NextResponse.json(
        { error: 'confirmOverwrite must be true to proceed with restore. This will OVERWRITE all current data.' },
        { status: 400 }
      )
    }

    // Find the backup record
    const backupRecord = await db.backupRecord.findFirst({
      where: { id: backupId, tenantId, status: 'completed' },
    })

    if (!backupRecord) {
      return NextResponse.json({ error: 'Completed backup not found' }, { status: 404 })
    }

    if (!backupRecord.storagePath) {
      return NextResponse.json({ error: 'Backup file path missing' }, { status: 500 })
    }

    // Pre-restore safety: auto-create a backup of current data
    let preRestoreBackupId: number | undefined

    try {
      const safetyBackup = await exportTenantData(tenantId, 'full', 'auto', [], 'Pre-restore safety backup')

      if (safetyBackup.success) {
        const safetyRecord = await db.backupRecord.create({
          data: {
            tenantId,
            type: 'full',
            status: 'completed',
            triggerSource: 'auto',
            description: `Pre-restore safety backup (before restoring backup #${backupId})`,
            sizeMb: safetyBackup.sizeMb,
            recordCount: safetyBackup.recordCount,
            storagePath: safetyBackup.storagePath,
            fileName: safetyBackup.fileName,
            startedAt: new Date(),
            completedAt: new Date(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 day retention for safety backups
          },
        })
        preRestoreBackupId = safetyRecord.id
      }
    } catch (err) {
      console.warn('[Restore] Pre-restore safety backup failed:', err)
      // Continue even if safety backup fails — but log the warning
    }

    // Execute restore
    const result = await restoreTenantData(backupRecord.storagePath, tenantId, preRestoreBackupId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Restore completed successfully',
        recordCount: result.recordCount,
        modelCounts: result.modelCounts,
        preRestoreBackupId,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error, preRestoreBackupId },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[Restore API] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
