'use client';

// ============================================================
// ExpenseList — DataTable of expenses with category badges and actions
// Data fetched from /api/expenses via useQuery
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, FileText } from 'lucide-react';
import { DataTable } from '@/components/organisms/data-table';
import {
  formatTaka,
  type ExpenseRecord,
  type ExpenseCategory,
  type PaymentMethod,
} from '@/lib/finance/sample-data';

const categoryBadgeStyles: Record<ExpenseCategory, { bg: string; text: string }> = {
  utilities: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400' },
  maintenance: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  stationery: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-400' },
  food: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  transport: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400' },
  salary: { bg: 'bg-slate-100 dark:bg-slate-800/30', text: 'text-slate-700 dark:text-slate-400' },
  misc: { bg: 'bg-gray-100 dark:bg-gray-800/30', text: 'text-gray-700 dark:text-gray-400' },
};

const categoryLabels: Record<ExpenseCategory, string> = {
  utilities: 'Utilities',
  maintenance: 'Maintenance',
  stationery: 'Stationery',
  food: 'Food',
  transport: 'Transport',
  salary: 'Salary',
  misc: 'Misc',
};

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  bkash: 'bKash',
  bank: 'Bank',
  cheque: 'Cheque',
};

function CategoryBadge({ category }: { category: ExpenseCategory }) {
  const styles = categoryBadgeStyles[category];
  return (
    <Badge variant="outline" className={`${styles.bg} ${styles.text} border-0 text-xs`}>
      {categoryLabels[category]}
    </Badge>
  );
}

/** Map API expense response to ExpenseRecord shape */
function mapApiExpense(raw: Record<string, unknown>): ExpenseRecord {
  // API may return expenseCategory object or a string category
  const categoryRaw = raw.expenseCategory ?? raw.category ?? raw.expense_category;
  let category: ExpenseCategory = 'misc';
  if (typeof categoryRaw === 'string') {
    category = categoryRaw as ExpenseCategory;
  } else if (typeof categoryRaw === 'object' && categoryRaw !== null) {
    category = (categoryRaw as Record<string, unknown>).name as ExpenseCategory ?? 'misc';
  }

  const methodRaw = raw.paymentMethod ?? raw.method ?? raw.payment_method;
  const method = (typeof methodRaw === 'string' ? methodRaw : 'cash') as PaymentMethod;

  return {
    id: String(raw.id ?? ''),
    category,
    description: String(raw.description ?? ''),
    amount: Number(raw.amount ?? 0),
    date: String(raw.expenseDate ?? raw.date ?? raw.expense_date ?? ''),
    method,
    receiptRef: String(raw.receiptRef ?? raw.receipt_ref ?? ''),
    note: String(raw.note ?? ''),
  };
}

interface ExpenseListProps {
  onEdit?: (expense: ExpenseRecord) => void;
  onDelete?: (expense: ExpenseRecord) => void;
}

export default function ExpenseList({ onEdit, onDelete }: ExpenseListProps) {
  const { data: expenses = [], isLoading } = useQuery<ExpenseRecord[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('/api/expenses?limit=100');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const json = await res.json();
      const rawList: unknown[] = json.data ?? json;
      return rawList.map((r) => mapApiExpense(r as Record<string, unknown>));
    },
  });

  const columns: ColumnDef<ExpenseRecord, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <p className="text-sm truncate max-w-[200px]">{row.original.description}</p>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {formatTaka(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{methodLabels[row.original.method]}</span>
      ),
    },
    {
      accessorKey: 'receiptRef',
      header: 'Receipt',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-emerald-600">
          <FileText className="h-3 w-3" />
          {row.original.receiptRef}
        </Button>
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
  ], [onEdit, onDelete]);

  const renderCard = (expense: ExpenseRecord) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <CategoryBadge category={expense.category} />
        <span className="text-xs text-muted-foreground">
          {new Date(expense.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </span>
      </div>
      <p className="text-sm">{expense.description}</p>
      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
        {formatTaka(expense.amount)}
      </p>
      <p className="text-xs text-muted-foreground">
        {methodLabels[expense.method]} • {expense.receiptRef}
      </p>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={expenses}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Search expenses..."
      sortable
      paginated
      pageSize={10}
      renderCard={renderCard}
      emptyMessage="No expenses found"
      emptyDescription="Add a new expense to get started."
    />
  );
}
