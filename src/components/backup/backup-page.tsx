'use client';

// ============================================================
// BackupPage — Main page combining all backup components
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import BackupStatsCards from './backup-stats-cards';
import BackupList from './backup-list';
import BackupCreateDialog from './backup-create-dialog';
import RestoreDialog from './restore-dialog';
import BackupScheduleSettings from './backup-schedule-settings';
import {
  type BackupRecord,
  type BackupScheduleConfig,
  type BackupStats,
  type BackupType,
  type BackupScope,
} from './backup-types';
import { apiFetch, apiFetchList, apiSubmit, apiDelete } from '@/lib/api-client';

// ── Default empty stats ────────────────────────────────────
const emptyStats: BackupStats = {
  totalBackups: 0,
  totalSizeMb: 0,
  lastBackupDate: null,
  scheduleEnabled: false,
  nextScheduledDate: null,
};

const defaultScheduleConfig: BackupScheduleConfig = {
  enabled: false,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  backupType: 'full',
  scopes: [],
};

// ── Map API backup record to component BackupRecord ────────
function mapApiBackup(raw: Record<string, unknown>): BackupRecord {
  return {
    id: String(raw.id),
    type: (raw.type as BackupType) || 'full',
    status: (raw.status as BackupRecord['status']) || 'pending',
    scopes: (raw.scopes as BackupScope[]) || [],
    description: (raw.description as string) || '',
    recordsCount: (raw.recordCount as number) || (raw.recordsCount as number) || 0,
    sizeMb: (raw.sizeMb as number) || 0,
    createdAt: raw.createdAt ? new Date(raw.createdAt as string).toISOString() : new Date().toISOString(),
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt as string).toISOString() : null,
    completedAt: raw.completedAt ? new Date(raw.completedAt as string).toISOString() : null,
  };
}

// ── Compute stats from backup list ─────────────────────────
function computeStats(backups: BackupRecord[], scheduleEnabled: boolean, nextScheduledDate: string | null): BackupStats {
  const completed = backups.filter(b => b.status === 'completed');
  return {
    totalBackups: backups.length,
    totalSizeMb: Math.round(completed.reduce((sum, b) => sum + b.sizeMb, 0) * 10) / 10,
    lastBackupDate: completed.length > 0 ? completed[0].completedAt || completed[0].createdAt : null,
    scheduleEnabled,
    nextScheduledDate,
  };
}

export default function BackupPage() {
  const queryClient = useQueryClient();
  const [restoreTarget, setRestoreTarget] = React.useState<BackupRecord | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);

  // ── Fetch backups ──────────────────────────────────────
  const {
    data: backupsResponse,
    isLoading: backupsLoading,
    isError: backupsError,
    refetch: refetchBackups,
  } = useQuery({
    queryKey: ['backups'],
    queryFn: async () => {
      const res = await apiFetchList<Record<string, unknown>>('/api/backups?limit=100');
      return res;
    },
  });

  const backups: BackupRecord[] = (backupsResponse?.data || []).map(mapApiBackup);

  // ── Fetch schedule config ──────────────────────────────
  const {
    data: scheduleData,
    isLoading: scheduleLoading,
  } = useQuery({
    queryKey: ['backup-schedule'],
    queryFn: async () => {
      return apiFetch<BackupScheduleConfig>('/api/backup-schedule');
    },
    staleTime: 5 * 60 * 1000,
  });

  const scheduleConfig: BackupScheduleConfig = scheduleData
    ? {
        enabled: scheduleData.enabled ?? false,
        frequency: scheduleData.frequency ?? 'daily',
        time: scheduleData.time ?? '02:00',
        retentionDays: scheduleData.retentionDays ?? 30,
        backupType: (scheduleData.backupType ?? ((scheduleData as unknown as Record<string, unknown>).type as BackupType)) ?? 'full',
        scopes: scheduleData.scopes ?? [],
      }
    : defaultScheduleConfig;

  // Compute stats from fetched data
  const nextScheduledDate = scheduleConfig.enabled
    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    : null;
  const stats = computeStats(backups, scheduleConfig.enabled, nextScheduledDate);
  const loading = backupsLoading || scheduleLoading;

  // ── Create backup mutation ──────────────────────────────
  const createBackupMutation = useMutation({
    mutationFn: async (options: {
      type: BackupType;
      scopes: BackupScope[];
      description: string;
      retentionDays: number;
    }) => {
      return apiSubmit<Record<string, unknown>>('/api/backups', 'POST', {
        type: options.type,
        scopes: options.scopes,
        description: options.description,
        retentionDays: options.retentionDays,
        triggerSource: 'manual',
      });
    },
    onSuccess: () => {
      toast.success('Backup created successfully');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create backup');
    },
  });

  // ── Delete backup mutation ──────────────────────────────
  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return apiDelete(`/api/backups/${backupId}`);
    },
    onSuccess: () => {
      toast.success('Backup deleted');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete backup');
    },
  });

  // ── Restore mutation ────────────────────────────────────
  const restoreMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return apiSubmit<{ success: boolean; message: string; recordCount?: number }>(
        '/api/restore',
        'POST',
        { backupId: Number(backupId), confirmOverwrite: true }
      );
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Restore completed successfully');
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to restore backup');
    },
  });

  // ── Save schedule mutation ──────────────────────────────
  const saveScheduleMutation = useMutation({
    mutationFn: async (config: BackupScheduleConfig) => {
      return apiSubmit<BackupScheduleConfig>('/api/backup-schedule', 'PUT', {
        enabled: config.enabled,
        frequency: config.frequency,
        time: config.time,
        retentionDays: config.retentionDays,
        type: config.backupType,
      });
    },
    onSuccess: () => {
      toast.success('Backup schedule updated');
      queryClient.invalidateQueries({ queryKey: ['backup-schedule'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update schedule');
    },
  });

  // ── Handlers ────────────────────────────────────────────
  const handleCreateBackup = async (options: {
    type: BackupType;
    scopes: BackupScope[];
    description: string;
    retentionDays: number;
  }) => {
    createBackupMutation.mutate(options);
  };

  const handleDownload = (backup: BackupRecord) => {
    window.open(`/api/backups/${backup.id}/download`, '_blank');
  };

  const handleRestore = (backup: BackupRecord) => {
    setRestoreTarget(backup);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async (backupId: string) => {
    const result = await restoreMutation.mutateAsync(backupId);
    return { success: result.success ?? true, message: result.message || 'Restore completed' };
  };

  const handleDelete = (backup: BackupRecord) => {
    if (confirm(`Are you sure you want to delete this backup? This action cannot be undone.`)) {
      deleteBackupMutation.mutate(backup.id);
    }
  };

  const handleSaveSchedule = async (config: BackupScheduleConfig) => {
    saveScheduleMutation.mutate(config);
  };

  // ── Error state ─────────────────────────────────────────
  if (backupsError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Backup & Restore"
          description="Manage data backups, restore points, and automated schedules"
        />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load backups</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching backup data. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetchBackups()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Restore"
        description="Manage data backups, restore points, and automated schedules"
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
          <TabsTrigger value="overview" className="gap-1.5">
            <Database className="h-4 w-4 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="h-4 w-4 hidden sm:inline" />
            History
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5">
            <Calendar className="h-4 w-4 hidden sm:inline" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <BackupStatsCards
              totalBackups={stats.totalBackups}
              totalSizeMb={stats.totalSizeMb}
              lastBackupDate={stats.lastBackupDate}
              scheduleEnabled={stats.scheduleEnabled}
              nextScheduledDate={stats.nextScheduledDate}
            />

            {/* Quick actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <BackupCreateDialog onCreateBackup={handleCreateBackup} />
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                const latest = backups.find(b => b.status === 'completed');
                if (latest) handleDownload(latest);
                else toast.info('No completed backups available to download');
              }}>
                <Database className="h-4 w-4" />
                Download Latest
              </Button>
            </div>

            {/* Recent backups preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Backups</h3>
              <BackupList
                backups={backups.slice(0, 3)}
                loading={loading}
                onDownload={handleDownload}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Backup History */}
        <TabsContent value="history">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                All Backups ({backups.length})
              </h3>
              <BackupCreateDialog onCreateBackup={handleCreateBackup} />
            </div>
            <BackupList
              backups={backups}
              loading={loading}
              onDownload={handleDownload}
              onRestore={handleRestore}
              onDelete={handleDelete}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Schedule */}
        <TabsContent value="schedule">
          <BackupScheduleSettings
            config={scheduleConfig}
            loading={loading}
            onSave={handleSaveSchedule}
          />
        </TabsContent>
      </Tabs>

      {/* Restore Dialog */}
      <RestoreDialog
        backup={restoreTarget}
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        onRestore={handleRestoreConfirm}
      />
    </div>
  );
}
