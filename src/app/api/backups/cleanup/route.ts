// ============================================================
// Backup Cleanup API — POST (cron: delete expired backups)
// Module 28: Backup & Restore
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { deleteBackupFile } from '@/lib/backup/storage'

/** POST /api/backups/cleanup — Delete expired backups */
export async function POST(_req: NextRequest) {
  try {
    // Find all expired backups
    const expiredBackups = await db.backupRecord.findMany({
      where: {
        status: { in: ['completed', 'failed'] },
        expiresAt: { not: null, lte: new Date() },
      },
      select: { id: true, tenantId: true, storagePath: true },
    })

    if (expiredBackups.length === 0) {
      return NextResponse.json({ success: true, deleted: 0, message: 'No expired backups found' })
    }

    // Delete files and records
    let deletedCount = 0
    const errors: string[] = []

    for (const backup of expiredBackups) {
      try {
        // Delete file from disk
        if (backup.storagePath) {
          await deleteBackupFile(backup.storagePath)
        }

        // Mark as expired (soft approach) then delete record
        await db.backupRecord.delete({ where: { id: backup.id } })
        deletedCount++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`Backup #${backup.id}: ${msg}`)
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      total: expiredBackups.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[Backup Cleanup API] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
