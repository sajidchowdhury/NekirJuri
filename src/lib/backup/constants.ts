// ============================================================
// Backup & Restore — Constants
// Module 28: Backup & Restore
// ============================================================

export const BACKUP_VERSION = '1.0'
export const BACKUP_DIR = 'data/backups'
export const DEFAULT_RETENTION_DAYS = 30
export const MAX_BACKUP_DESCRIPTION_LENGTH = 200

/** Backup types */
export const BACKUP_TYPES = ['full', 'partial', 'scheduled'] as const
export type BackupType = (typeof BACKUP_TYPES)[number]

/** Backup statuses */
export const BACKUP_STATUSES = ['pending', 'running', 'completed', 'failed', 'expired'] as const
export type BackupStatus = (typeof BACKUP_STATUSES)[number]

/** Trigger sources */
export const TRIGGER_SOURCES = ['manual', 'scheduled', 'auto'] as const
export type TriggerSource = (typeof TRIGGER_SOURCES)[number]

/** Partial backup scopes */
export const PARTIAL_SCOPES = ['academic', 'finance', 'inventory', 'accounting', 'website', 'hr'] as const
export type PartialScope = (typeof PARTIAL_SCOPES)[number]

/** Schedule frequencies */
export const SCHEDULE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const
export type ScheduleFrequency = (typeof SCHEDULE_FREQUENCIES)[number]

/** Restore modes */
export const RESTORE_MODES = ['overwrite'] as const
export type RestoreMode = (typeof RESTORE_MODES)[number]

/** Backup schedule config shape */
export interface BackupScheduleConfig {
  enabled: boolean
  frequency: ScheduleFrequency
  time: string        // HH:mm format (Asia/Dhaka timezone)
  retentionDays: number
  type: BackupType
}
