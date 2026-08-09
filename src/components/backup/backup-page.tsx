'use client';

// ============================================================
// BackupPage — Main page combining all backup components
// ============================================================

import * as React from 'react';
import { Database, Clock, Calendar } from 'lucide-react';
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

// ============================================================
// Sample data for demonstration (will be replaced by API calls)
// ============================================================

const sampleBackups: BackupRecord[] = [
  {
    id: 'b1',
    type: 'full',
    status: 'completed',
    scopes: [],
    description: 'End of semester backup',
    recordsCount: 12450,
    sizeMb: 256.4,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'b2',
    type: 'partial',
    status: 'completed',
    scopes: ['academic', 'finance'],
    description: 'Mid-term partial backup',
    recordsCount: 5230,
    sizeMb: 89.2,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
  },
  {
    id: 'b3',
    type: 'full',
    status: 'running',
    scopes: [],
    description: 'Scheduled daily backup',
    recordsCount: 0,
    sizeMb: 0,
    createdAt: new Date().toISOString(),
    expiresAt: null,
    completedAt: null,
  },
  {
    id: 'b4',
    type: 'partial',
    status: 'failed',
    scopes: ['inventory'],
    description: 'Inventory backup attempt',
    recordsCount: 0,
    sizeMb: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: null,
    completedAt: null,
  },
  {
    id: 'b5',
    type: 'full',
    status: 'expired',
    scopes: [],
    description: 'Old monthly backup',
    recordsCount: 10200,
    sizeMb: 210.8,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
  },
];

const sampleStats: BackupStats = {
  totalBackups: 5,
  totalSizeMb: 556.4,
  lastBackupDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  scheduleEnabled: true,
  nextScheduledDate: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
};

const sampleScheduleConfig: BackupScheduleConfig = {
  enabled: true,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  backupType: 'full',
  scopes: [],
};

export default function BackupPage() {
  // State
  const [backups, setBackups] = React.useState<BackupRecord[]>(sampleBackups);
  const [stats, setStats] = React.useState<BackupStats>(sampleStats);
  const [scheduleConfig, setScheduleConfig] = React.useState<BackupScheduleConfig>(sampleScheduleConfig);
  const [loading, setLoading] = React.useState(true);
  const [restoreTarget, setRestoreTarget] = React.useState<BackupRecord | null>(null);
  const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleCreateBackup = async (options: {
    type: BackupType;
    scopes: BackupScope[];
    description: string;
    retentionDays: number;
  }) => {
    // POST /api/backups — simulated
    const newBackup: BackupRecord = {
      id: `b${Date.now()}`,
      type: options.type,
      status: 'pending',
      scopes: options.scopes,
      description: options.description,
      recordsCount: 0,
      sizeMb: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + options.retentionDays * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: null,
    };
    setBackups((prev) => [newBackup, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalBackups: prev.totalBackups + 1,
    }));

    // Simulate progression to running then completed
    setTimeout(() => {
      setBackups((prev) =>
        prev.map((b) => (b.id === newBackup.id ? { ...b, status: 'running' } : b))
      );
    }, 1000);

    setTimeout(() => {
      setBackups((prev) =>
        prev.map((b) =>
          b.id === newBackup.id
            ? {
                ...b,
                status: 'completed',
                recordsCount: Math.floor(Math.random() * 15000) + 3000,
                sizeMb: Math.round((Math.random() * 300 + 50) * 10) / 10,
                completedAt: new Date().toISOString(),
              }
            : b
        )
      );
      setStats((prev) => ({
        ...prev,
        lastBackupDate: new Date().toISOString(),
      }));
    }, 5000);
  };

  const handleDownload = (backup: BackupRecord) => {
    // In production: window.open(`/api/backups/${backup.id}/download`)
    console.log('Download backup:', backup.id);
  };

  const handleRestore = (backup: BackupRecord) => {
    setRestoreTarget(backup);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async (backupId: string) => {
    // POST /api/restore — simulated
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { success: true, message: 'All data restored successfully. 12,450 records have been recovered.' };
  };

  const handleDelete = (backup: BackupRecord) => {
    setBackups((prev) => prev.filter((b) => b.id !== backup.id));
    setStats((prev) => ({
      ...prev,
      totalBackups: prev.totalBackups - 1,
      totalSizeMb: prev.totalSizeMb - backup.sizeMb,
    }));
  };

  const handleSaveSchedule = async (config: BackupScheduleConfig) => {
    // PUT /api/backup-schedule — simulated
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setScheduleConfig(config);
    setStats((prev) => ({
      ...prev,
      scheduleEnabled: config.enabled,
      nextScheduledDate: config.enabled
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null,
    }));
  };

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
              <Button variant="outline" size="sm" className="gap-1.5">
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
