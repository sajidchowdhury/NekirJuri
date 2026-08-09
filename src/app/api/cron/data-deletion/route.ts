// ============================================================
// Data Deletion Cron API — POST (trigger data deletion job)
// CR-7: Deletes business data for terminated tenants 30+ days
// ============================================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { runDataDeletionJob } from '@/lib/data-deletion'

/** POST /api/cron/data-deletion — Run the data deletion job */
export async function POST(_req: NextRequest) {
  try {
    // Verify authorization — only cron services should call this
    // In production, add API key verification here

    console.log('[DataDeletion Cron] Starting data deletion job...')
    const result = await runDataDeletionJob()
    console.log(`[DataDeletion Cron] Job complete: ${result.tenantsProcessed} tenants, ${result.totalRecordsDeleted} records deleted`)

    return NextResponse.json({
      success: result.success,
      tenantsProcessed: result.tenantsProcessed,
      totalRecordsDeleted: result.totalRecordsDeleted,
      errors: result.errors.length > 0 ? result.errors : undefined,
    })
  } catch (error) {
    console.error('[DataDeletion Cron] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
