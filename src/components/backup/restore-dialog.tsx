'use client';

// ============================================================
// RestoreDialog — AlertDialog for restore confirmation
// ============================================================

import * as React from 'react';
import { AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { type BackupRecord, formatSize } from './backup-types';

export interface RestoreDialogProps {
  backup: BackupRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore?: (backupId: string) => Promise<{ success: boolean; message: string }>;
}

export default function RestoreDialog({
  backup,
  open,
  onOpenChange,
  onRestore,
}: RestoreDialogProps) {
  const [confirmText, setConfirmText] = React.useState('');
  const [restoring, setRestoring] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const isConfirmed = confirmText === 'RESTORE';

  const handleRestore = async () => {
    if (!backup || !isConfirmed) return;
    setRestoring(true);
    setResult(null);
    try {
      const res = await onRestore?.(backup.id);
      setResult(res ?? { success: true, message: 'Restore completed successfully' });
    } catch {
      setResult({ success: false, message: 'Restore failed. Please try again.' });
    } finally {
      setRestoring(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setResult(null);
    onOpenChange(false);
  };

  if (!backup) return null;

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Backup</AlertDialogTitle>
          <AlertDialogDescription>
            Restore all data from this backup to the current tenant.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Warning alert */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will <strong>OVERWRITE</strong> all current data for this tenant.
              This action cannot be undone. Please ensure you have a recent backup before proceeding.
            </AlertDescription>
          </Alert>

          {/* Backup details */}
          <div className="rounded-md border p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{backup.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {new Date(backup.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Records</span>
              <span className="font-medium tabular-nums">{backup.recordsCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium tabular-nums">{formatSize(backup.sizeMb)}</span>
            </div>
          </div>

          {/* Confirmation input */}
          {!result && (
            <div className="space-y-2">
              <Label>
                Type <strong className="text-destructive">RESTORE</strong> to confirm
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESTORE"
                autoComplete="off"
              />
            </div>
          )}

          {/* Result message */}
          {result && (
            <div className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
              result.success
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                : 'border-destructive/30 bg-destructive/5'
            }`}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
              <span>{result.message}</span>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={restoring}>
            {result ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {!result && (
            <Button
              onClick={handleRestore}
              disabled={!isConfirmed || restoring}
              variant="destructive"
              className="gap-1.5"
            >
              {restoring && <Loader2 className="h-4 w-4 animate-spin" />}
              {restoring ? 'Restoring...' : 'Restore'}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
