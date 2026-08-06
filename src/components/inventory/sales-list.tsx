'use client';

// ============================================================
// SalesList — DataTable of sales fetched from API
// CR-4: Shows student badge, addToFee indicator, fee invoice link
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Printer, Loader2, GraduationCap, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/organisms/data-table';
import {
  type SaleStatus,
  type PaymentMethod,
  formatTaka,
  saleStatusClasses,
  paymentMethodClasses,
} from '@/lib/inventory/sample-data';

// ==================== API Sale Type ====================

export interface ApiSale {
  id: number;
  invoiceNo: string;
  customerName?: string | null;
  saleDate: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  addToFee?: boolean;
  student?: { id: number; name: string; registrationNo?: string | null } | null;
  feeInvoice?: { id: number; invoiceNo: string; status: string } | null;
  salesItems: {
    id: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: { id: number; name: string; code: string; unit?: string | null };
  }[];
  createdAt: string;
}

// ==================== Props ====================

export interface SalesListProps {
  onView?: (sale: ApiSale) => void;
  onPrint?: (sale: ApiSale) => void;
  refreshKey?: number; // Change this to trigger a re-fetch
}

// ==================== Component ====================

export default function SalesList({ onView, onPrint, refreshKey }: SalesListProps) {
  const [sales, setSales] = React.useState<ApiSale[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch sales from API
  const fetchSales = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/sales?limit=100');
      if (!res.ok) throw new Error('Failed to fetch sales');
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || []);
      setSales(items);
    } catch (err) {
      console.error('[SalesList] Fetch failed:', err);
      setError('Could not load sales. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSales();
  }, [fetchSales, refreshKey]);

  const columns: ColumnDef<ApiSale, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice #',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.invoiceNo}</span>
      ),
    },
    {
      accessorKey: 'saleDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.saleDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => {
        const sale = row.original;
        const isStudent = !!sale.student;
        return (
          <div className="flex items-center gap-1.5">
            {isStudent && <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            <span className="text-sm">{sale.student?.name || sale.customerName || '—'}</span>
            {isStudent && (
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:border-emerald-700">
                Student
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: 'itemsCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.salesItems?.length ?? 0}</span>
      ),
    },
    {
      accessorKey: 'netAmount',
      header: 'Total',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
          {formatTaka(Number(row.original.netAmount))}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }) => {
        const sale = row.original;
        // CR-4: Show "Fee Invoice" badge for addToFee sales
        if (sale.paymentMethod === 'fee-invoice' || sale.addToFee) {
          return (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
              <Receipt className="h-3 w-3" />
              Fee Invoice
            </Badge>
          );
        }
        const method = sale.paymentMethod as PaymentMethod;
        const mc = paymentMethodClasses[method];
        if (!mc) return <span className="text-sm">{method}</span>;
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
        if (!sc) return <span className="text-sm">{status}</span>;
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

  const renderCard = React.useCallback((sale: ApiSale) => {
    const sc = saleStatusClasses[sale.status as SaleStatus];
    const isStudent = !!sale.student;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between">
          <span className="font-mono text-sm font-medium">{sale.invoiceNo}</span>
          {sc && (
            <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1 text-[10px]`}>
              <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
              {sc.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {isStudent && <GraduationCap className="h-3 w-3 text-emerald-600" />}
          <p className="text-sm">{sale.student?.name || sale.customerName || '—'}</p>
          {isStudent && (
            <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-300">S</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          {sale.addToFee ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
              Fee Invoice
            </Badge>
          ) : (
            <Badge variant="secondary" className={`${paymentMethodClasses[sale.paymentMethod as PaymentMethod]?.bg || ''} ${paymentMethodClasses[sale.paymentMethod as PaymentMethod]?.text || ''} text-[10px]`}>
              {sale.paymentMethod}
            </Badge>
          )}
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            {formatTaka(Number(sale.netAmount))}
          </span>
        </div>
      </motion.div>
    );
  }, []);

  // Loading state
  if (loading && sales.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading sales...
      </div>
    );
  }

  // Error state
  if (error && sales.length === 0) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchSales}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={sales}
      searchPlaceholder="Search sales..."
      renderCard={renderCard}
      pageSize={10}
    />
  );
}
