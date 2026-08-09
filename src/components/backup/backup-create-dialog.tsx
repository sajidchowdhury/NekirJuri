'use client';

// ============================================================
// BackupCreateDialog — Dialog to trigger a new backup
// ============================================================

import * as React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { type BackupType, type BackupScope } from './backup-types';

export interface BackupCreateDialogProps {
  onCreateBackup?: (options: {
    type: BackupType;
    scopes: BackupScope[];
    description: string;
    retentionDays: number;
  }) => void;
}

const SCOPE_OPTIONS: { value: BackupScope; label: string }[] = [
  { value: 'academic', label: 'Academic' },
  { value: 'finance', label: 'Finance' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'website', label: 'Website' },
  { value: 'hr', label: 'HR' },
];

export default function BackupCreateDialog({
  onCreateBackup,
}: BackupCreateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<BackupType>('full');
  const [scopes, setScopes] = React.useState<BackupScope[]>([]);
  const [description, setDescription] = React.useState('');
  const [retentionDays, setRetentionDays] = React.useState(30);
  const [submitting, setSubmitting] = React.useState(false);

  const handleScopeToggle = (scope: BackupScope) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onCreateBackup?.({
        type,
        scopes: type === 'partial' ? scopes : [],
        description,
        retentionDays,
      });
      setOpen(false);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setType('full');
    setScopes([]);
    setDescription('');
    setRetentionDays(30);
  };

  const isValid = type === 'full' || scopes.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5" size="sm">
          <Plus className="h-4 w-4" />
          Create Backup
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Backup</DialogTitle>
          <DialogDescription>
            Choose the backup type and configuration. This may take a few minutes for large datasets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-2">
            <Label>Backup Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as BackupType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full — All modules</SelectItem>
                <SelectItem value="partial">Partial — Select modules</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partial scopes */}
          {type === 'partial' && (
            <div className="space-y-2">
              <Label>Select Modules</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {SCOPE_OPTIONS.map((scope) => (
                  <label
                    key={scope.value}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={scopes.includes(scope.value)}
                      onCheckedChange={() => handleScopeToggle(scope.value)}
                    />
                    {scope.label}
                  </label>
                ))}
              </div>
              {scopes.length === 0 && (
                <p className="text-xs text-destructive">
                  Select at least one module for partial backup
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              placeholder="e.g. End of semester backup"
              rows={2}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/200
            </p>
          </div>

          {/* Retention days */}
          <div className="space-y-2">
            <Label>Retention Period (days)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={retentionDays}
              onChange={(e) => {
                const val = Math.min(365, Math.max(1, Number(e.target.value) || 1));
                setRetentionDays(val);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Creating...' : 'Create Backup'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
