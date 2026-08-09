'use client';

// ============================================================
// JournalEntryList — DataTable of journal entries
// Fully wired to API — no sample data fallbacks
// Entry #, Date, Description, Debit, Credit, Balanced indicator,
// Status badge, Actions
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, Eye, Edit3, Send, MoreHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/organisms/data-table';
import { formatTaka } from '@/lib/accounting/sample-data';

// ── API Journal Entry type ───────────────────────────────
interface ApiJournalEntry {
  id: number;
  entryNo: string;
  entryDate: string;
  narration?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  totalDebit: number;
  totalCredit: number;
  status: string;
  journalItems: {
    id: number;
    accountId: number;
    debit: number;
    credit: number;
    narration?: string | null;
    account: { id: number; code: string; name: string; accountType: string };
  }[];
  createdAt: string;
}

export interface JournalEntryListProps {
  /** Filter by status */
  statusFilter?: 'all' | 'draft' | 'posted';
  /** View entry callback */
  onView?: (entry: ApiJournalEntry) => void;
  /** Edit entry callback (only draft entries) */
  onEdit?: (entry: ApiJournalEntry) => void;
  /** Post entry callback (only draft entries) */
  onPost?: (entry: ApiJournalEntry) => void;
  /** Additional CSS classes */
  className?: string;
}

export default function JournalEntryList({
  statusFilter = 'all',
  onView,
  onEdit,
  onPost,
  className,
}: JournalEntryListProps) {
  // ── Fetch journal entries from API ──────────────────────
  const {
    data: entriesResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['journal-entries', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/journal-entries?${params}`);
      if (!res.ok) throw new Error('Failed to fetch journal entries');
      return res.json();
    },
  });

  const entries: ApiJournalEntry[] = entriesResponse?.data || [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: ColumnDef<ApiJournalEntry, unknown>[] = [
    {
      accessorKey: 'entryNo',
      header: 'Entry #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">{row.original.entryNo}</span>
      ),
    },
    {
      accessorKey: 'entryDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs">{formatDate(row.original.entryDate)}</span>
      ),
    },
    {
      accessorKey: 'narration',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-xs truncate max-w-[200px] block">{row.original.narration || '—'}</span>
      ),
    },
    {
      id: 'totalDebit',
      header: 'Total Debit',
      cell: ({ row }) => (
        <span className="text-xs font-mono">{formatTaka(Number(row.original.totalDebit))}</span>
      ),
    },
    {
      id: 'totalCredit',
      header: 'Total Credit',
      cell: ({ row }) => (
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
          {formatTaka(Number(row.original.totalCredit))}
        </span>
      ),
    },
    {
      id: 'balanced',
      header: 'Balanced',
      cell: ({ row }) => {
        const totalD = Number(row.original.totalDebit);
        const totalC = Number(row.original.totalCredit);
        const isBalanced = Math.abs(totalD - totalC) < 0.01;
        return isBalanced ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> ✓
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-medium">
            <XCircle className="h-3.5 w-3.5" /> ✗
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant="secondary"
            className={cn(
              'h-5 text-[10px] px-1.5',
              status === 'posted'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-stone-100 dark:bg-stone-800/30 text-stone-600 dark:text-stone-400'
            )}
          >
            {status === 'posted' ? 'Posted' : 'Draft'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const entry = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onView?.(entry)}>
                <Eye className="h-3.5 w-3.5" /> View
              </DropdownMenuItem>
              {entry.status === 'draft' && onEdit && (
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(entry)}>
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
              )}
              {entry.status === 'draft' && onPost && (
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onPost(entry)}>
                  <Send className="h-3.5 w-3.5 text-emerald-600" /> Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Mobile card renderer
  const renderCard = (entry: ApiJournalEntry) => {
    const totalD = Number(entry.totalDebit);
    const totalC = Number(entry.totalCredit);
    const isBalanced = Math.abs(totalD - totalC) < 0.01;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-medium">{entry.entryNo}</span>
          <Badge
            variant="secondary"
            className={cn(
              'h-5 text-[10px] px-1.5',
              entry.status === 'posted'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-stone-100 dark:bg-stone-800/30 text-stone-600 dark:text-stone-400'
            )}
          >
            {entry.status === 'posted' ? 'Posted' : 'Draft'}
          </Badge>
        </div>
        <p className="text-sm font-medium">{entry.narration || '—'}</p>
        <div className="flex items-center justify-between text-xs">
          <span>{formatDate(entry.entryDate)}</span>
          <span className="font-mono">
            Dr: {formatTaka(totalD)} / Cr:{' '}
            <span className="text-emerald-600 dark:text-emerald-400">{formatTaka(totalC)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isBalanced ? (
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          ) : (
            <XCircle className="h-3 w-3 text-rose-600" />
          )}
          <span className="text-[10px] text-muted-foreground">
            {isBalanced ? 'Balanced' : 'Unbalanced'}
          </span>
        </div>
      </div>
    );
  };

  // ── Error state ────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-semibold">Failed to load journal entries</h3>
        <p className="text-sm text-muted-foreground max-w-md">There was an error fetching journal entry data. Please try again.</p>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={entries}
      searchable
      searchPlaceholder="Search entries..."
      sortable
      paginated
      pageSize={10}
      className={className}
      renderCard={renderCard}
      isLoading={isLoading}
      emptyMessage="No journal entries found"
      emptyDescription="Create your first journal entry to get started."
    />
  );
}
