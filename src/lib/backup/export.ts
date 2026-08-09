// ============================================================
// Backup & Restore — Export (Backup) Logic
// Module 28: Backup & Restore
// Exports tenant data to structured JSON for backup
// ============================================================

import { db } from '@/lib/db'
import { BACKUP_VERSION } from './constants'
import type { BackupType, TriggerSource, PartialScope } from './constants'
import { BACKUP_MODELS, getModelsForScopes, getPrismaModel } from './models'
import { writeBackupFile, generateBackupFileName } from './storage'

/** Backup metadata header */
export interface BackupMeta {
  version: string
  tenantId: number
  tenantName: string
  tenantSlug: string
  exportedAt: string
  type: BackupType
  triggerSource: TriggerSource
  recordCount: number
   
  models: Record<string, number>
}

/** Full backup file structure */
export interface BackupFile {
  meta: BackupMeta
   
  data: Record<string, any[]>
}

/** Export result */
export interface ExportResult {
  success: boolean
  fileName: string
  storagePath: string
  sizeMb: number
  recordCount: number
   
  modelCounts: Record<string, number>
  error?: string
}

/**
 * Export all (or partial) tenant data to a JSON backup file.
 *
 * @param tenantId - The tenant to backup
 * @param type - Backup type (full/partial/scheduled)
 * @param triggerSource - Who triggered the backup
 * @param scopes - Partial scopes (empty = full backup)
 * @param description - Optional user note
 */
export async function exportTenantData(
  tenantId: number,
  type: BackupType = 'full',
  triggerSource: TriggerSource = 'manual',
  scopes: PartialScope[] = [],
  _description?: string
): Promise<ExportResult> {
  const fileName = generateBackupFileName(type)

  try {
    // 1. Get tenant info for metadata
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true },
    })

    if (!tenant) {
      return { success: false, fileName, storagePath: '', sizeMb: 0, recordCount: 0, modelCounts: {}, error: 'Tenant not found' }
    }

    // 2. Determine which models to export
    const models = scopes.length > 0 ? getModelsForScopes(scopes) : BACKUP_MODELS

    // 3. Export each model's data
     
    const data: Record<string, any[]> = {}
    const modelCounts: Record<string, number> = {}
    let totalRecords = 0

    for (const modelDef of models) {
      const prismaModel = getPrismaModel(modelDef.key)
      if (!prismaModel) {
        console.warn(`[Backup] Model "${modelDef.key}" not found on Prisma client, skipping`)
        continue
      }

      try {
        const where = modelDef.hasTenantId ? { tenantId } : {}
        const records = await prismaModel.findMany({ where })
        data[modelDef.key] = records
        modelCounts[modelDef.label] = records.length
        totalRecords += records.length
      } catch (err) {
        console.warn(`[Backup] Error exporting model "${modelDef.key}":`, err)
        data[modelDef.key] = []
        modelCounts[modelDef.label] = 0
      }
    }

    // 4. Build backup file structure
    const backupFile: BackupFile = {
      meta: {
        version: BACKUP_VERSION,
        tenantId: tenant.id,
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        exportedAt: new Date().toISOString(),
        type,
        triggerSource,
        recordCount: totalRecords,
        models: modelCounts,
      },
      data,
    }

    // 5. Write to filesystem
    const { storagePath, sizeBytes } = await writeBackupFile(tenantId, fileName, backupFile)
    const sizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2))

    return {
      success: true,
      fileName,
      storagePath,
      sizeMb,
      recordCount: totalRecords,
      modelCounts,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown export error'
    console.error('[Backup] Export failed:', msg)
    return { success: false, fileName, storagePath: '', sizeMb: 0, recordCount: 0, modelCounts: {}, error: msg }
  }
}
