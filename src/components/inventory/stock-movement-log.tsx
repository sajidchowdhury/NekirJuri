'use client';

// ============================================================
// StockMovementLog — Timeline of stock movements with filter
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  type StockMovementType,
  sampleStockMovements,
} from '@/lib/inventory/sample-data';
import { fadeIn, staggerChildren, transitions } from '@/lib/animations';

const typeConfig: Record<StockMovementType, { bg: string; text: string; dot: string; icon: React.ElementType; label: string }> = {
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

export default function StockMovementLog() {
  const [filter, setFilter] = React.useState<'all' | 'in' | 'out'>('all');

  const filteredMovements = React.useMemo(() => {
    if (filter === 'all') return sampleStockMovements;
    return sampleStockMovements.filter(m => m.type === filter);
  }, [filter]);

  const filters: { key: 'all' | 'in' | 'out'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'in', label: 'Stock In' },
    { key: 'out', label: 'Stock Out' },
  ];

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
          {filteredMovements.map((movement, index) => {
            const config = typeConfig[movement.type];
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
                      <span className="text-sm font-medium">{movement.productName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{movement.dateTime}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Qty: <span className={movement.type === 'in' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </span>
                    </span>
                    <span>Ref: <span className="font-mono">{movement.reference}</span></span>
                    <span>Balance: <span className="font-medium">{movement.balanceAfter}</span></span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{movement.reason}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
