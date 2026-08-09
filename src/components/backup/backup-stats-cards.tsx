'use client';

// ============================================================
// BackupStatsCards — 4 stat cards for backup overview
// ============================================================

import * as React from 'react';
import { Database, HardDrive, Clock, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import AnimatedCounter from '@/components/ui/animated-counter';
import { type BackupStats, formatRelativeTime, formatSize } from './backup-types';

export type BackupStatsCardsProps = BackupStats;

export default function BackupStatsCards({
  totalBackups,
  totalSizeMb,
  lastBackupDate,
  scheduleEnabled,
  nextScheduledDate,
}: BackupStatsCardsProps) {
  const cards = [
    {
      title: 'Total Backups',
      icon: Database,
      content: (
        <AnimatedCounter value={totalBackups} className="text-2xl font-bold" />
      ),
      subtitle: totalBackups === 1 ? 'backup' : 'backups',
    },
    {
      title: 'Total Size',
      icon: HardDrive,
      content: (
        <span className="text-2xl font-bold tabular-nums">
          {formatSize(totalSizeMb)}
        </span>
      ),
      subtitle: 'across all backups',
    },
    {
      title: 'Last Backup',
      icon: Clock,
      content: (
        <span className="text-lg font-semibold">
          {formatRelativeTime(lastBackupDate)}
        </span>
      ),
      subtitle: lastBackupDate
        ? new Date(lastBackupDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'No backups yet',
    },
    {
      title: 'Next Scheduled',
      icon: Calendar,
      content: (
        <span className="text-lg font-semibold">
          {scheduleEnabled
            ? formatRelativeTime(nextScheduledDate)
            : 'Not scheduled'}
        </span>
      ),
      subtitle: scheduleEnabled ? 'Auto-backup enabled' : 'Enable in Schedule tab',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="py-4">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-0.5">
                {card.content}
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
