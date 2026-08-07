// ============================================================
// Backup & Restore — File Storage Layer
// Module 28: Backup & Restore
// ============================================================

import { promises as fs } from 'fs'
import path from 'path'
import { BACKUP_DIR } from './constants'

/**
 * Get the absolute path for a tenant's backup directory.
 */
export function getTenantBackupDir(tenantId: number): string {
  return path.join(process.cwd(), BACKUP_DIR, String(tenantId))
}

/**
 * Get the absolute path for a specific backup file.
 */
export function getBackupFilePath(tenantId: number, fileName: string): string {
  return path.join(getTenantBackupDir(tenantId), fileName)
}

/**
 * Generate a backup filename from type and timestamp.
 * Format: backup_{YYYYMMDD_HHmmss}_{type}.json
 */
export function generateBackupFileName(type: string): string {
  const now = new Date()
  const ts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')
  return `backup_${ts}_${type}.json`
}

/**
 * Ensure a tenant's backup directory exists.
 */
export async function ensureBackupDir(tenantId: number): Promise<string> {
  const dir = getTenantBackupDir(tenantId)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

/**
 * Write backup data to file.
 * Returns the relative storage path.
 */
export async function writeBackupFile(
  tenantId: number,
  fileName: string,
   
  data: any
): Promise<{ storagePath: string; sizeBytes: number }> {
  await ensureBackupDir(tenantId)
  const filePath = getBackupFilePath(tenantId, fileName)
  const jsonStr = JSON.stringify(data, null, 2)
  await fs.writeFile(filePath, jsonStr, 'utf-8')
  const sizeBytes = Buffer.byteLength(jsonStr, 'utf-8')
  const storagePath = `${BACKUP_DIR}/${tenantId}/${fileName}`
  return { storagePath, sizeBytes }
}

/**
 * Read a backup file from disk.
 */
 
export async function readBackupFile(storagePath: string): Promise<any> {
  const filePath = path.join(process.cwd(), storagePath)
  const jsonStr = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(jsonStr)
}

/**
 * Delete a backup file from disk.
 */
export async function deleteBackupFile(storagePath: string): Promise<void> {
  try {
    const filePath = path.join(process.cwd(), storagePath)
    await fs.unlink(filePath)
  } catch (err) {
    // File may already be deleted — ignore
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
}

/**
 * Check if a backup file exists.
 */
export async function backupFileExists(storagePath: string): Promise<boolean> {
  try {
    const filePath = path.join(process.cwd(), storagePath)
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Get file size in MB.
 */
export async function getFileSizeMb(storagePath: string): Promise<number> {
  const filePath = path.join(process.cwd(), storagePath)
  const stats = await fs.stat(filePath)
  return stats.size / (1024 * 1024)
}

/**
 * List all backup files for a tenant.
 */
export async function listBackupFiles(tenantId: number): Promise<string[]> {
  try {
    const dir = getTenantBackupDir(tenantId)
    return await fs.readdir(dir)
  } catch {
    return []
  }
}
