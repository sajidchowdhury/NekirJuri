// ============================================================
// Backup & Restore — Shared Types
// ============================================================

export type BackupType = 'full' | 'partial';

export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'expired';

export type BackupScope = 'academic' | 'finance' | 'inventory' | 'accounting' | 'website' | 'hr';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

export interface BackupRecord {
  id: string;
  type: BackupType;
  status: BackupStatus;
  scopes: BackupScope[];
  description: string;
  recordsCount: number;
  sizeMb: number;
  createdAt: string;
  expiresAt: string | null;
  completedAt: string | null;
}

export interface BackupScheduleConfig {
  enabled: boolean;
  frequency: ScheduleFrequency;
  time: string;
  retentionDays: number;
  backupType: BackupType;
  scopes: BackupScope[];
}

export interface BackupStats {
  totalBackups: number;
  totalSizeMb: number;
  lastBackupDate: string | null;
  scheduleEnabled: boolean;
  nextScheduledDate: string | null;
}

/** Format a date string to relative time (e.g. "2 hours ago") */
export function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/** Format MB to human-readable size */
export function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${(mb * 1024).toFixed(0)} KB`;
}
