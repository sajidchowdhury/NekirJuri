// ============================================================
// Backup & Restore — Import (Restore) Logic
// Module 28: Backup & Restore
// Restores tenant data from a structured JSON backup
// ============================================================

import { db } from '@/lib/db'
import { BACKUP_VERSION } from './constants'
import type { BackupFile, BackupMeta } from './export'
import { BACKUP_MODELS, getModelsForScopes, getModelsInReverseOrder, getPrismaModel } from './models'
import { readBackupFile } from './storage'

/** Restore result */
export interface RestoreResult {
  success: boolean
  recordCount: number
   
  modelCounts: Record<string, number>
  preRestoreBackupId?: number
  error?: string
}

/**
 * Validate a backup file structure and metadata.
 */
export function validateBackupFile(
   
  backupData: any,
  expectedTenantId?: number
): { valid: boolean; meta?: BackupMeta; error?: string } {
  if (!backupData || typeof backupData !== 'object') {
    return { valid: false, error: 'Invalid backup file: not a valid JSON object' }
  }

  if (!backupData.meta || !backupData.data) {
    return { valid: false, error: 'Invalid backup file: missing meta or data section' }
  }

  const meta = backupData.meta as BackupMeta

  if (meta.version !== BACKUP_VERSION) {
    return { valid: false, error: `Backup version mismatch: file is v${meta.version}, system expects v${BACKUP_VERSION}` }
  }

  if (expectedTenantId && meta.tenantId !== expectedTenantId) {
    return { valid: false, error: `Tenant mismatch: backup is for tenant ${meta.tenantId}, expected ${expectedTenantId}` }
  }

  return { valid: true, meta }
}

/**
 * Restore tenant data from a backup file.
 *
 * Strategy:
 * 1. Validate the backup file
 * 2. Delete existing tenant business data (reverse dependency order)
 * 3. Re-insert from backup (forward dependency order)
 *
 * @param storagePath - Path to the backup JSON file
 * @param tenantId - The tenant to restore into
 * @param preRestoreBackupId - ID of the auto-created safety backup (for audit)
 */
export async function restoreTenantData(
  storagePath: string,
  tenantId: number,
  preRestoreBackupId?: number
): Promise<RestoreResult> {
  try {
    // 1. Read and validate backup file
    const backupData = await readBackupFile(storagePath) as BackupFile
    const validation = validateBackupFile(backupData, tenantId)

    if (!validation.valid) {
      return { success: false, recordCount: 0, modelCounts: {}, error: validation.error }
    }

    const meta = validation.meta!

    // 2. Determine which models are in the backup
    const modelKeys = Object.keys(backupData.data)
    const modelsInBackup = BACKUP_MODELS.filter((m) => modelKeys.includes(m.key))

    // 3. Delete existing data in REVERSE dependency order
    const deleteOrder = getModelsInReverseOrder(modelsInBackup)
    let deletedCount = 0

    for (const modelDef of deleteOrder) {
      const prismaModel = getPrismaModel(modelDef.key)
      if (!prismaModel) continue

      try {
        const where = modelDef.hasTenantId ? { tenantId } : {}
        const result = await prismaModel.deleteMany({ where })
        deletedCount += result.count
      } catch (err) {
        console.warn(`[Restore] Error deleting model "${modelDef.key}":`, err)
      }
    }

    // 4. Insert data in FORWARD dependency order
     
    const modelCounts: Record<string, number> = {}
    let totalInserted = 0

    for (const modelDef of modelsInBackup) {
      const prismaModel = getPrismaModel(modelDef.key)
      if (!prismaModel) continue

      const records = backupData.data[modelDef.key]
      if (!records || records.length === 0) {
        modelCounts[modelDef.label] = 0
        continue
      }

      try {
        // Strip auto-generated fields to avoid conflicts
        const cleanRecords = records.map((record: Record<string, unknown>) => {
          const { createdAt, updatedAt, ...rest } = record
          void createdAt; void updatedAt // suppress unused
          return rest
        })

        await prismaModel.createMany({ data: cleanRecords, skipDuplicates: true })
        modelCounts[modelDef.label] = records.length
        totalInserted += records.length
      } catch (err) {
        console.warn(`[Restore] Error inserting model "${modelDef.key}":`, err)
        modelCounts[modelDef.label] = 0
      }
    }

    // 5. Log audit entry
    try {
      await db.auditLog.create({
        data: {
          tenantId,
          action: 'RESTORE',
          entityType: 'BackupRecord',
          oldValues: { deletedCount },
          newValues: { restoredCount: totalInserted, backupMeta: meta, preRestoreBackupId },
        },
      })
    } catch {
      // Audit log failure shouldn't fail the restore
    }

    return {
      success: true,
      recordCount: totalInserted,
      modelCounts,
      preRestoreBackupId,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown restore error'
    console.error('[Restore] Restore failed:', msg)
    return { success: false, recordCount: 0, modelCounts: {}, error: msg }
  }
}

/**
 * Count tenant records for a dry-run estimate.
 */
export async function countTenantRecords(tenantId: number): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}

  for (const modelDef of BACKUP_MODELS) {
    const prismaModel = getPrismaModel(modelDef.key)
    if (!prismaModel) continue

    try {
      const where = modelDef.hasTenantId ? { tenantId } : {}
      const count = await prismaModel.count({ where })
      counts[modelDef.label] = count
    } catch {
      counts[modelDef.label] = 0
    }
  }

  return counts
}
