'use client';

// ============================================================
// SalesList — DataTable of sales with status filter
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/organisms/data-table';
import {
  type Sale,
  type SaleStatus,
  type PaymentMethod,
  formatTaka,
  saleStatusClasses,
  paymentMethodClasses,
  sampleSales,
} from '@/lib/inventory/sample-data';

export interface SalesListProps {
  onView?: (sale: Sale) => void;
  onPrint?: (sale: Sale) => void;
}

export default function SalesList({ onView, onPrint }: SalesListProps) {
  const columns: ColumnDef<Sale, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice #',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.invoiceNo}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.customerName}</span>
      ),
    },
    {
      id: 'itemsCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.items.length}</span>
      ),
    },
    {
      accessorKey: 'grandTotal',
      header: 'Total',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(row.original.grandTotal)}</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }) => {
        const method = row.original.paymentMethod as PaymentMethod;
        const mc = paymentMethodClasses[method];
        return (
          <Badge variant="secondary" className={`${mc.bg} ${mc.text} gap-1`}>
            <span className={`h-1.5 w-1.5 rounded-full ${mc.dot}`} />
            {method}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status as SaleStatus;
        const sc = saleStatusClasses[status];
        return (
          <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(row.original)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPrint?.(row.original)}>
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [onView, onPrint]);

  const renderCard = React.useCallback((sale: Sale) => {
    const sc = saleStatusClasses[sale.status];
    const mc = paymentMethodClasses[sale.paymentMethod];
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between">
          <span className="font-mono text-sm font-medium">{sale.invoiceNo}</span>
          <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1 text-[10px]`}>
            <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
            {sc.label}
          </Badge>
        </div>
        <p className="text-sm">{sale.customerName}</p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className={`${mc.bg} ${mc.text} text-[10px]`}>
            {sale.paymentMethod}
          </Badge>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(sale.grandTotal)}</span>
        </div>
      </motion.div>
    );
  }, []);

  return (
    <DataTable
      columns={columns}
      data={sampleSales}
      searchPlaceholder="Search sales..."
      renderCard={renderCard}
      pageSize={10}
    />
  );
}
