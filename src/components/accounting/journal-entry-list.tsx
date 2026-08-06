'use client';

// ============================================================
// JournalEntryList — DataTable of journal entries
// Entry #, Date, Description, Debit, Credit, Balanced indicator,
// Status badge, Actions
// ============================================================

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, Eye, Edit3, Send, MoreHorizontal } from 'lucide-react';
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
import {
  journalEntries,
  formatTaka,
  type JournalEntry,
  type JournalEntryStatus,
} from '@/lib/accounting/sample-data';

export interface JournalEntryListProps {
  /** Filter by status */
  statusFilter?: 'all' | 'draft' | 'posted';
  /** View entry callback */
  onView?: (entry: JournalEntry) => void;
  /** Edit entry callback (only draft entries) */
  onEdit?: (entry: JournalEntry) => void;
  /** Post entry callback (only draft entries) */
  onPost?: (entry: JournalEntry) => void;
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
  // Filter data
  const filteredData = React.useMemo(() => {
    if (statusFilter === 'all') return journalEntries;
    return journalEntries.filter((e) => e.status === statusFilter);
  }, [statusFilter]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: ColumnDef<JournalEntry, unknown>[] = [
    {
      accessorKey: 'entryNo',
      header: 'Entry #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-medium">{row.original.entryNo}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs">{formatDate(row.original.date)}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-xs truncate max-w-[200px] block">{row.original.description}</span>
      ),
    },
    {
      id: 'totalDebit',
      header: 'Total Debit',
      cell: ({ row }) => {
        const total = row.original.lineItems.reduce((s, l) => s + l.debit, 0);
        return <span className="text-xs font-mono">{formatTaka(total)}</span>;
      },
    },
    {
      id: 'totalCredit',
      header: 'Total Credit',
      cell: ({ row }) => {
        const total = row.original.lineItems.reduce((s, l) => s + l.credit, 0);
        return (
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
            {formatTaka(total)}
          </span>
        );
      },
    },
    {
      id: 'balanced',
      header: 'Balanced',
      cell: ({ row }) => {
        const totalD = row.original.lineItems.reduce((s, l) => s + l.debit, 0);
        const totalC = row.original.lineItems.reduce((s, l) => s + l.credit, 0);
        const isBalanced = totalD === totalC;
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
  const renderCard = (entry: JournalEntry) => {
    const totalD = entry.lineItems.reduce((s, l) => s + l.debit, 0);
    const totalC = entry.lineItems.reduce((s, l) => s + l.credit, 0);
    const isBalanced = totalD === totalC;

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
        <p className="text-sm font-medium">{entry.description}</p>
        <div className="flex items-center justify-between text-xs">
          <span>{formatDate(entry.date)}</span>
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

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      searchable
      searchPlaceholder="Search entries..."
      sortable
      paginated
      pageSize={10}
      className={className}
      renderCard={renderCard}
    />
  );
}
