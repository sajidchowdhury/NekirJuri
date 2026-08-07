'use client';

// ============================================================
// BackupList — Data table of backup records with actions
// ============================================================

import * as React from 'react';
import { Download, RotateCcw, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type BackupRecord,
  type BackupStatus,
  formatRelativeTime,
  formatSize,
} from './backup-types';

export interface BackupListProps {
  backups: BackupRecord[];
  loading?: boolean;
  onDownload?: (backup: BackupRecord) => void;
  onRestore?: (backup: BackupRecord) => void;
  onDelete?: (backup: BackupRecord) => void;
}

/** Status badge configuration */
const statusConfig: Record<
  BackupStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }
> = {
  pending: { label: 'Pending', variant: 'secondary', className: '' },
  running: { label: 'Running', variant: 'default', className: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  completed: { label: 'Completed', variant: 'default', className: 'bg-emerald-600 text-white hover:bg-emerald-700' },
  failed: { label: 'Failed', variant: 'destructive', className: '' },
  expired: { label: 'Expired', variant: 'outline', className: '' },
};

/** Type badge configuration */
const typeConfig = {
  full: { label: 'Full', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  partial: { label: 'Partial', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
};

const ITEMS_PER_PAGE = 10;

export default function BackupList({
  backups,
  loading = false,
  onDownload,
  onRestore,
  onDelete,
}: BackupListProps) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(backups.length / ITEMS_PER_PAGE));
  const paginatedBackups = backups.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Reset page if backups change and page is out of range
  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (backups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Download className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">No backups yet</p>
        <p className="text-xs text-muted-foreground">Create your first backup to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Records</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden lg:table-cell">Expires</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBackups.map((backup) => {
              const status = statusConfig[backup.status];
              const type = typeConfig[backup.type];
              return (
                <TableRow key={backup.id}>
                  <TableCell>
                    <Badge variant="outline" className={type.className}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {backup.status === 'running' && (
                        <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                      )}
                      <Badge variant={status.variant} className={status.className}>
                        {status.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums">
                    {backup.recordsCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatSize(backup.sizeMb)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {formatRelativeTime(backup.createdAt)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {backup.expiresAt
                      ? new Date(backup.expiresAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Never'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDownload?.(backup)}>
                          <Download className="h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRestore?.(backup)}
                          disabled={backup.status !== 'completed'}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(backup)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, backups.length)} of{' '}
            {backups.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
