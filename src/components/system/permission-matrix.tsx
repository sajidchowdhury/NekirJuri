'use client';

// ============================================================
// PermissionMatrix — Permission matrix in a Dialog
// ============================================================

import * as React from 'react';
import { Shield } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  type Role,
  type ModuleName,
  allPermissions,
} from '@/lib/system/sample-data';

const moduleOrder: ModuleName[] = ['Academic', 'Finance', 'Inventory', 'Accounting', 'Website', 'System'];

const moduleIcons: Record<ModuleName, string> = {
  Academic: '🎓',
  Finance: '💰',
  Inventory: '📦',
  Accounting: '📊',
  Website: '🌐',
  System: '⚙️',
};

interface PermissionMatrixProps {
  role: Role;
  onSave?: (roleId: string, permissions: string[]) => void;
  readOnly?: boolean;
}

export default function PermissionMatrix({ role, onSave, readOnly = false }: PermissionMatrixProps) {
  const [permissions, setPermissions] = React.useState<string[]>(role.permissions);

  const isReadOnly = readOnly || role.isSystem;

  const handleToggle = (permId: string, checked: boolean) => {
    if (isReadOnly) return;
    if (checked) {
      setPermissions((prev) => [...prev, permId]);
    } else {
      setPermissions((prev) => prev.filter((p) => p !== permId));
    }
  };

  const handleToggleModule = (module: ModuleName, checked: boolean) => {
    if (isReadOnly) return;
    const modulePerms = allPermissions.filter((p) => p.module === module).map((p) => p.id);
    if (checked) {
      setPermissions((prev) => [...new Set([...prev, ...modulePerms])]);
    } else {
      setPermissions((prev) => prev.filter((p) => !modulePerms.includes(p)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>
          {permissions.length} of {allPermissions.length} permissions granted
        </span>
        {isReadOnly && (
          <span className="ml-auto text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded-md">
            Read-only
          </span>
        )}
      </div>

      {/* Permission matrix */}
      <ScrollArea className="max-h-[50vh]">
        <div className="space-y-4 pr-4">
          {moduleOrder.map((module) => {
            const modulePerms = allPermissions.filter((p) => p.module === module);
            const allChecked = modulePerms.every((p) => permissions.includes(p.id));
            const someChecked = modulePerms.some((p) => permissions.includes(p.id));

            return (
              <div key={module}>
                {/* Module header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{moduleIcons[module]}</span>
                  <span className="font-semibold text-sm">{module}</span>
                  <Checkbox
                    checked={allChecked ? true : someChecked ? 'indeterminate' : false}
                    onCheckedChange={(checked) => handleToggleModule(module, !!checked)}
                    disabled={isReadOnly}
                    className="ml-auto"
                  />
                </div>

                {/* Permission rows */}
                <div className="ml-7 space-y-1.5">
                  {modulePerms.map((perm) => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                        isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50'
                      } transition-colors`}
                    >
                      <Checkbox
                        checked={permissions.includes(perm.id)}
                        onCheckedChange={(checked) => handleToggle(perm.id, !!checked)}
                        disabled={isReadOnly}
                      />
                      <span className={permissions.includes(perm.id) ? 'text-foreground' : 'text-muted-foreground'}>
                        {perm.label}
                      </span>
                    </label>
                  ))}
                </div>

                <Separator className="mt-4" />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Save button */}
      {!isReadOnly && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={() => onSave?.(role.id, permissions)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Save Permissions
          </Button>
        </div>
      )}
    </div>
  );
}
