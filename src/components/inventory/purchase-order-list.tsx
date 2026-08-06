'use client';

// ============================================================
// PurchaseOrderList — DataTable of purchase orders with status filter
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, PackageCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/organisms/data-table';
import {
  type PurchaseOrder,
  type PurchaseOrderStatus,
  formatTaka,
  poStatusClasses,
  samplePurchaseOrders,
} from '@/lib/inventory/sample-data';

export interface PurchaseOrderListProps {
  onView?: (po: PurchaseOrder) => void;
  onEdit?: (po: PurchaseOrder) => void;
  onReceive?: (po: PurchaseOrder) => void;
  statusFilter?: string;
}

export default function PurchaseOrderList({ onView, onEdit, onReceive, statusFilter = 'all' }: PurchaseOrderListProps) {
  const filteredPOs = React.useMemo(() => {
    if (statusFilter === 'all') return samplePurchaseOrders;
    return samplePurchaseOrders.filter(po => po.status === statusFilter);
  }, [statusFilter]);

  const columns: ColumnDef<PurchaseOrder, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'poNumber',
      header: 'PO Number',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.poNumber}</span>
      ),
    },
    {
      accessorKey: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.supplierName}</span>
      ),
    },
    {
      accessorKey: 'orderDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status as PurchaseOrderStatus;
        const sc = poStatusClasses[status];
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
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(po)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {po.status === 'draft' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit?.(po)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {(po.status === 'ordered' || po.status === 'partially-received') && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => onReceive?.(po)}>
                <PackageCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [onView, onEdit, onReceive]);

  const renderCard = React.useCallback((po: PurchaseOrder) => {
    const sc = poStatusClasses[po.status];
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between">
          <span className="font-mono text-sm font-medium">{po.poNumber}</span>
          <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1 text-[10px]`}>
            <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
            {sc.label}
          </Badge>
        </div>
        <p className="text-sm">{po.supplierName}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(po.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(po.grandTotal)}</span>
        </div>
      </motion.div>
    );
  }, []);

  return (
    <DataTable
      columns={columns}
      data={filteredPOs}
      searchPlaceholder="Search purchase orders..."
      renderCard={renderCard}
      pageSize={10}
    />
  );
}
