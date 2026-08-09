// ============================================================
// Backup Download API — GET (stream backup file)
// Module 28: Backup & Restore
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'
import { readBackupFile } from '@/lib/backup/storage'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/backups/[id]/download — Download backup file */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const tenantId = getTenantId(req)
    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 401 })
    }

    const { id } = await context.params
    const backupId = parseInt(id, 10)
    if (isNaN(backupId)) {
      return NextResponse.json({ error: 'Invalid backup ID' }, { status: 400 })
    }

    const record = await db.backupRecord.findFirst({
      where: { id: backupId, tenantId, status: 'completed' },
    })

    if (!record) {
      return NextResponse.json({ error: 'Backup not found or not completed' }, { status: 404 })
    }

    if (!record.storagePath) {
      return NextResponse.json({ error: 'Backup file path missing' }, { status: 500 })
    }

    // Read the backup file
    const backupData = await readBackupFile(record.storagePath)
    const jsonStr = JSON.stringify(backupData, null, 2)

    // Return as downloadable JSON file
    const fileName = record.fileName || `backup_${backupId}.json`
    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('[Backup Download API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
