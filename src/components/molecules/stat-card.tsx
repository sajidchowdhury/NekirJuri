'use client';

// ============================================================
// StatCard — Dashboard statistic card with icon, value, and trend
// Supports variant-based color theming and loading skeleton state
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/** Trend data for the stat card */
export interface StatCardTrend {
  /** Percentage value (positive = up, negative = down) */
  value: number;
  /** Label text (e.g., "vs last month") */
  label: string;
}

/** Props for StatCard component */
export interface StatCardProps {
  /** Card title (e.g., "Total Students") */
  title: string;
  /** Display value (e.g., "1,250") */
  value: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Optional trend indicator */
  trend?: StatCardTrend;
  /** Color variant (default: 'default') */
  variant?: 'default' | 'emerald' | 'gold' | 'rose';
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Variant color mapping for icon background and border accent */
const variantStyles = {
  default: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-t-emerald-600 dark:border-t-emerald-400',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-t-emerald-600 dark:border-t-emerald-400',
  },
  gold: {
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    border: 'border-t-amber-600 dark:border-t-amber-400',
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconText: 'text-rose-600 dark:text-rose-400',
    border: 'border-t-rose-600 dark:border-t-rose-400',
  },
} as const;

/**
 * StatCard displays a key metric with icon, value, and optional trend.
 * Uses a decorative 3px top border (ArchCard-like) and colored icon circle.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  loading = false,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return <StatCardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card
        className={cn(
          'border-t-[3px]',
          styles.border,
          'transition-shadow duration-150 hover:shadow-md',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Icon circle */}
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                styles.iconBg
              )}
            >
              <Icon className={cn('h-5 w-5', styles.iconText)} />
            </div>

            {/* Trend indicator */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  trend.value >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                )}
              >
                {trend.value >= 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{title}</p>
          </div>

          {/* Trend label */}
          {trend && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {trend.label}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Skeleton loader for StatCard */
export function StatCardSkeleton() {
  return (
    <Card className="border-t-[3px] border-t-muted">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
