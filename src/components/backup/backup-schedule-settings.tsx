'use client';

// ============================================================
// BackupScheduleSettings — Schedule configuration
// ============================================================

import * as React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type BackupScheduleConfig,
  type ScheduleFrequency,
  type BackupType,
  type BackupScope,
} from './backup-types';

export interface BackupScheduleSettingsProps {
  config?: BackupScheduleConfig;
  loading?: boolean;
  onSave?: (config: BackupScheduleConfig) => Promise<void>;
}

const DEFAULT_CONFIG: BackupScheduleConfig = {
  enabled: false,
  frequency: 'daily',
  time: '02:00',
  retentionDays: 30,
  backupType: 'full',
  scopes: [],
};

const SCOPE_OPTIONS: { value: BackupScope; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'finance', label: 'Finance' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'website', label: 'Website' },
  { value: 'hr', label: 'HR' },
];

export default function BackupScheduleSettings({
  config,
  loading = false,
  onSave,
}: BackupScheduleSettingsProps) {
  const [localConfig, setLocalConfig] = React.useState<BackupScheduleConfig>(
    config ?? DEFAULT_CONFIG
  );
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Sync when config prop changes
  React.useEffect(() => {
    if (config) setLocalConfig(config);
  }, [config]);

  const update = <K extends keyof BackupScheduleConfig>(
    key: K,
    value: BackupScheduleConfig[K]
  ) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleScopeToggle = (scope: BackupScope) => {
    setLocalConfig((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(localConfig);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Auto-backup toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auto-Backup</CardTitle>
          <CardDescription>
            Automatically create backups on a schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-md border px-4 py-3">
            <div>
              <Label className="text-sm">Enable Auto-Backup</Label>
              <p className="text-xs text-muted-foreground">
                Create backups automatically based on the schedule below
              </p>
            </div>
            <Switch
              checked={localConfig.enabled}
              onCheckedChange={(val) => update('enabled', val)}
            />
          </div>

          {localConfig.enabled && (
            <>
              {/* Frequency & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={localConfig.frequency}
                    onValueChange={(val) => update('frequency', val as ScheduleFrequency)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={localConfig.time}
                    onChange={(e) => update('time', e.target.value)}
                  />
                </div>
              </div>

              {/* Retention & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Retention Period (days)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={localConfig.retentionDays}
                    onChange={(e) => {
                      const val = Math.min(365, Math.max(1, Number(e.target.value) || 1));
                      update('retentionDays', val);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backup Type</Label>
                  <Select
                    value={localConfig.backupType}
                    onValueChange={(val) => update('backupType', val as BackupType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full — All modules</SelectItem>
                      <SelectItem value="partial">Partial — Select modules</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Partial scopes */}
              {localConfig.backupType === 'partial' && (
                <div className="space-y-2">
                  <Label>Select Modules</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-md border p-3">
                    {SCOPE_OPTIONS.map((scope) => (
                      <label
                        key={scope.value}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={localConfig.scopes.includes(scope.value)}
                          onChange={() => handleScopeToggle(scope.value)}
                          className="rounded border-input"
                        />
                        {scope.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Schedule saved successfully
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
          size="sm"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Schedule'}
        </Button>
      </div>
    </div>
  );
}
