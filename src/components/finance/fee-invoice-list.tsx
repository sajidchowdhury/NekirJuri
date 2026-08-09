'use client';

// ============================================================
// FeeInvoiceList — DataTable of invoices with status colors
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  type ColumnDef,
} from '@tanstack/react-table';
import { Eye, MoreHorizontal, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/atoms/status-badge';
import { DataTable } from '@/components/organisms/data-table';
import {
  type FeeInvoice,
  type InvoiceStatus,
  formatTaka,
} from '@/lib/finance/sample-data';

interface FeeInvoiceListProps {
  onViewInvoice?: (invoice: FeeInvoice) => void;
  onGenerateInvoice?: () => void;
}

const statusMap: Record<InvoiceStatus, 'paid' | 'partial' | 'overdue'> = {
  paid: 'paid',
  partial: 'partial',
  overdue: 'overdue',
};

/** Map API invoice response to FeeInvoice shape the component expects */
function mapApiInvoice(raw: Record<string, unknown>): FeeInvoice {
  return {
    id: String(raw.id ?? ''),
    invoiceNo: String(raw.invoiceNo ?? raw.invoice_no ?? ''),
    studentId: String(raw.studentId ?? raw.student_id ?? ''),
    studentName: String(raw.studentName ?? raw.student_name ?? (raw.student as Record<string, unknown>)?.name ?? ''),
    studentNameBn: String(raw.studentNameBn ?? raw.student_name_bn ?? (raw.student as Record<string, unknown>)?.nameBn ?? ''),
    className: String(raw.className ?? raw.class_name ?? (raw.student as Record<string, unknown>)?.className ?? ''),
    academicSession: String(raw.academicSession ?? raw.academic_session ?? ''),
    totalAmount: Number(raw.totalAmount ?? raw.total_amount ?? 0),
    paidAmount: Number(raw.paidAmount ?? raw.paid_amount ?? 0),
    discountAmount: Number(raw.discountAmount ?? raw.discount_amount ?? 0),
    balanceAmount: Number(raw.balanceAmount ?? raw.balance_amount ?? 0),
    status: (raw.status as InvoiceStatus) ?? 'overdue',
    dueDate: String(raw.dueDate ?? raw.due_date ?? ''),
    generatedDate: String(raw.generatedDate ?? raw.generated_date ?? ''),
    lineItems: (raw.lineItems ?? raw.line_items ?? []) as FeeInvoice['lineItems'],
    payments: (raw.payments ?? []) as FeeInvoice['payments'],
  };
}

export default function FeeInvoiceList({ onViewInvoice, onGenerateInvoice }: FeeInvoiceListProps) {
  const { data: invoices = [], isLoading } = useQuery<FeeInvoice[]>({
    queryKey: ['fee-invoices'],
    queryFn: async () => {
      const res = await fetch('/api/fee-invoices?limit=100');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const json = await res.json();
      const rawList: unknown[] = json.data ?? json;
      return rawList.map((r) => mapApiInvoice(r as Record<string, unknown>));
    },
  });

  const columns: ColumnDef<FeeInvoice, unknown>[] = [
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {row.original.invoiceNo}
        </span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.original.studentName}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.studentNameBn}</p>
        </div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-normal">
          {row.original.className}
        </Badge>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {formatTaka(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => (
        <span className="text-emerald-600 dark:text-emerald-400">
          {formatTaka(row.original.paidAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'balanceAmount',
      header: 'Balance',
      cell: ({ row }) => (
        <span className={row.original.balanceAmount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-muted-foreground'}>
          {formatTaka(row.original.balanceAmount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={statusMap[row.original.status]} />
      ),
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.dueDate}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onViewInvoice?.(row.original)}>
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Printer className="h-4 w-4" />
              Print Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      searchable
      searchPlaceholder="Search invoices..."
      sortable
      paginated
      pageSize={10}
      onRowClick={onViewInvoice}
      renderCard={(invoice: FeeInvoice) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {invoice.invoiceNo}
            </span>
            <StatusBadge status={statusMap[invoice.status]} />
          </div>
          <p className="font-medium text-sm">{invoice.studentName}</p>
          <p className="text-xs text-muted-foreground">{invoice.studentNameBn} • {invoice.className}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total: <span className="font-semibold text-amber-600 dark:text-amber-400">{formatTaka(invoice.totalAmount)}</span></span>
            <span className="text-muted-foreground">Balance: <span className={`font-semibold ${invoice.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatTaka(invoice.balanceAmount)}</span></span>
          </div>
        </div>
      )}
    />
  );
}
