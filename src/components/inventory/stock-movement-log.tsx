'use client';

// ============================================================
// StockMovementLog — Timeline of stock movements with filter
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fadeIn, staggerChildren, transitions } from '@/lib/animations';

// ── API Stock Movement type ──────────────────────────────
interface ApiStockMovement {
  id: number;
  productId: number;
  movementType: string;
  quantity: number;
  referenceType?: string | null;
  referenceId?: number | null;
  remarks?: string | null;
  stockAfter: number;
  product: { id: number; name: string; code: string; unit?: string | null; currentStock?: number };
  createdAt: string;
}

type MovementType = 'in' | 'out';

const typeConfig: Record<MovementType, { bg: string; text: string; dot: string; icon: React.ElementType; label: string }> = {
  in: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    icon: ArrowDownCircle,
    label: 'Stock In',
  },
  out: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    icon: ArrowUpCircle,
    label: 'Stock Out',
  },
};

const mapMovementType = (type: string): MovementType => {
  if (type === 'in') return 'in';
  return 'out';
};

export default function StockMovementLog() {
  const [filter, setFilter] = React.useState<'all' | 'in' | 'out'>('all');

  // ── Fetch stock movements from API ──────────────────────
  const {
    data: movementsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['stock-movements', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filter !== 'all') params.set('movementType', filter);
      const res = await fetch(`/api/stock-movements?${params}`);
      if (!res.ok) throw new Error('Failed to fetch stock movements');
      return res.json();
    },
  });

  const movements: ApiStockMovement[] = movementsResponse?.data || [];

  const filters: { key: 'all' | 'in' | 'out'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'Stock In' },
    { key: 'out', label: 'Stock Out' },
  ];

  // ── Error state ────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-semibold">Failed to load stock movements</h3>
        <p className="text-sm text-muted-foreground max-w-md">There was an error fetching movement data. Please try again.</p>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  // ── Loading state ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <Button key={f.key} variant="outline" size="sm" disabled>
              {f.label}
            </Button>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4 py-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 rounded-lg border border-border p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-48" />
                <div className="h-3 bg-muted rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────
  if (movements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {filters.map(f => (
            <Button
              key={f.key}
              variant={filter === f.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ArrowDownCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No stock movements</h3>
          <p className="text-sm text-muted-foreground mt-1">Stock movements will appear here when products are received or sold.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {filters.map(f => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <motion.div
        initial={staggerChildren.initial}
        animate={staggerChildren.animate}
        className="relative"
      >
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-0">
          {movements.map((movement, index) => {
            const mType = mapMovementType(movement.movementType);
            const config = typeConfig[mType];
            const Icon = config.icon;
            return (
              <motion.div
                key={movement.id}
                initial={fadeIn.initial}
                animate={fadeIn.animate}
                transition={{ ...transitions.normal, delay: index * 0.03 }}
                className="relative flex gap-4 py-3"
              >
                {/* Dot */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} z-10`}>
                  <Icon className={`h-5 w-5 ${config.text}`} />
                </div>

                {/* Content */}
                <div className="flex-1 rounded-lg border border-border bg-card p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`${config.bg} ${config.text} gap-1 text-[10px]`}>
                        <span className={`h-1 w-1 rounded-full ${config.dot}`} />
                        {config.label}
                      </Badge>
                      <span className="text-sm font-medium">{movement.product?.name || '—'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(movement.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Qty: <span className={mType === 'in' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                        {mType === 'in' ? '+' : '-'}{movement.quantity}
                      </span>
                    </span>
                    <span>Ref: <span className="font-mono">{movement.referenceType || 'manual'}</span></span>
                    <span>Balance: <span className="font-medium">{movement.stockAfter}</span></span>
                  </div>
                  {movement.remarks && (
                    <p className="mt-1 text-xs text-muted-foreground">{movement.remarks}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
