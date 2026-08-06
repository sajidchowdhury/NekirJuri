'use client';

// ============================================================
// DonorList — DataTable of donors with category badges and actions
// ============================================================

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/organisms/data-table';
import {
  sampleDonors,
  formatTaka,
  type Donor,
  type DonationCategory,
} from '@/lib/finance/sample-data';

const categoryBadgeStyles: Record<DonationCategory, { bg: string; text: string }> = {
  zakat: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  sadaqah: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  general: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400' },
  construction: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400' },
  education: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400' },
};

const categoryLabels: Record<DonationCategory, string> = {
  zakat: 'Zakat',
  sadaqah: 'Sadaqah',
  general: 'General',
  construction: 'Construction',
  education: 'Education',
};

function CategoryBadge({ category }: { category: DonationCategory }) {
  const styles = categoryBadgeStyles[category];
  return (
    <Badge variant="outline" className={`${styles.bg} ${styles.text} border-0 text-xs`}>
      {categoryLabels[category]}
    </Badge>
  );
}

interface DonorListProps {
  onView?: (donor: Donor) => void;
  onEdit?: (donor: Donor) => void;
  onDelete?: (donor: Donor) => void;
}

export default function DonorList({ onView, onEdit, onDelete }: DonorListProps) {
  const columns: ColumnDef<Donor, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Donor Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.nameBn}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    },
    {
      accessorKey: 'totalDonated',
      header: 'Total Donated',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {formatTaka(row.original.totalDonated)}
        </span>
      ),
    },
    {
      accessorKey: 'lastDonationDate',
      header: 'Last Donation',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.lastDonationDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-mono">{row.original.phone}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(row.original)} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(row.original)} className="gap-2 cursor-pointer">
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(row.original)} className="gap-2 cursor-pointer text-rose-600">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [onView, onEdit, onDelete]);

  const renderCard = (donor: Donor) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-medium">{donor.name}</p>
        <CategoryBadge category={donor.category} />
      </div>
      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
        {formatTaka(donor.totalDonated)}
      </p>
      <p className="text-xs text-muted-foreground">
        Last: {new Date(donor.lastDonationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={sampleDonors}
      searchable
      searchPlaceholder="Search donors..."
      sortable
      paginated
      pageSize={10}
      renderCard={renderCard}
      emptyMessage="No donors found"
      emptyDescription="Add a new donor to get started."
    />
  );
}
