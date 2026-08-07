// ============================================================
// Backups [id] API — GET (details) + DELETE (remove backup)
// Module 28: Backup & Restore
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getTenantId } from '@/lib/api-utils'
import { deleteBackupFile } from '@/lib/backup/storage'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/backups/[id] — Get single backup record */
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
      where: { id: backupId, tenantId },
    })

    if (!record) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('[Backup Detail API] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** DELETE /api/backups/[id] — Delete a backup record + its file */
export async function DELETE(req: NextRequest, context: RouteContext) {
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
      where: { id: backupId, tenantId },
    })

    if (!record) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Don't allow deleting a running backup
    if (record.status === 'running') {
      return NextResponse.json({ error: 'Cannot delete a running backup' }, { status: 409 })
    }

    // Delete the file from disk
    if (record.storagePath) {
      await deleteBackupFile(record.storagePath)
    }

    // Delete the database record
    await db.backupRecord.delete({ where: { id: backupId } })

    return NextResponse.json({ success: true, message: 'Backup deleted' })
  } catch (error) {
    console.error('[Backup Detail API] DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
