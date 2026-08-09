'use client';

// ============================================================
// PurchaseOrderList — DataTable of purchase orders with status filter
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/organisms/data-table';
import {
  type PurchaseOrderStatus,
  formatTaka,
  poStatusClasses,
} from '@/lib/inventory/sample-data';

// ── API Purchase type ────────────────────────────────────

interface ApiPurchase {
  id: number;
  purchaseNo: string;
  supplierId: number;
  purchaseDate: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  status: string;
  remarks?: string | null;
  supplier: { id: number; name: string; code: string; phone?: string | null };
  purchaseItems: {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountAmount?: number;
    product: { id: number; name: string; code: string; unit?: string | null; currentStock?: number };
  }[];
  createdAt: string;
}

export interface PurchaseOrderListProps {
  onView?: (po: ApiPurchase) => void;
  onEdit?: (po: ApiPurchase) => void;
  onReceive?: (po: ApiPurchase) => void;
  statusFilter?: string;
}

export default function PurchaseOrderList({ onView, onEdit, onReceive, statusFilter = 'all' }: PurchaseOrderListProps) {
  // ── Fetch purchases from API ────────────────────────────
  const {
    data: purchasesResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchases', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '200');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/purchases?${params}`);
      if (!res.ok) throw new Error('Failed to fetch purchases');
      return res.json();
    },
  });

  const purchases: ApiPurchase[] = purchasesResponse?.data || [];

  // ── Map API status to PurchaseOrderStatus ───────────────
  const mapStatus = (status: string): PurchaseOrderStatus => {
    if (status === 'draft' || status === 'ordered' || status === 'received' || status === 'cancelled') return status as PurchaseOrderStatus;
    if (status === 'partially-received' || status === 'partially_received') return 'partially-received';
    return 'draft';
  };

  const columns: ColumnDef<ApiPurchase, unknown>[] = [
    {
      accessorKey: 'purchaseNo',
      header: 'PO Number',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.purchaseNo}</span>
      ),
    },
    {
      id: 'supplierName',
      header: 'Supplier',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.supplier?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'purchaseDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      id: 'itemsCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.purchaseItems?.length || 0}</span>
      ),
    },
    {
      accessorKey: 'netAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(Number(row.original.netAmount))}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = mapStatus(row.original.status);
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
        const status = mapStatus(po.status);
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView?.(po)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {status === 'draft' && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit?.(po)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {(status === 'ordered' || status === 'partially-received') && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => onReceive?.(po)}>
                <PackageCheck className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const renderCard = React.useCallback((po: ApiPurchase) => {
    const status = mapStatus(po.status);
    const sc = poStatusClasses[status];
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between">
          <span className="font-mono text-sm font-medium">{po.purchaseNo}</span>
          <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1 text-[10px]`}>
            <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
            {sc.label}
          </Badge>
        </div>
        <p className="text-sm">{po.supplier?.name || '—'}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(po.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(Number(po.netAmount))}</span>
        </div>
      </motion.div>
    );
  }, []);

  // ── Error state ────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-semibold">Failed to load purchase orders</h3>
        <p className="text-sm text-muted-foreground max-w-md">There was an error fetching purchase data. Please try again.</p>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={purchases}
      searchPlaceholder="Search purchase orders..."
      renderCard={renderCard}
      pageSize={10}
      isLoading={isLoading}
      emptyMessage="No purchase orders found"
      emptyDescription="Create your first purchase order to get started."
    />
  );
}
