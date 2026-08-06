'use client';

// ============================================================
// LoadingSkeleton — Skeleton loader patterns for common layouts
// Exports: StatCardSkeleton, TableSkeleton, FormSkeleton, ChartSkeleton
// Uses shadcn Skeleton component internally
// ============================================================

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ── StatCardSkeleton ──────────────────────────────────────

/** Props for StatCardSkeleton */
export interface StatCardSkeletonProps {
  /** Number of stat cards to render (default: 4) */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatCardSkeleton renders a responsive grid of stat card placeholders.
 * Each card has: icon circle + 2 text lines.
 */
export function StatCardSkeleton({
  count = 4,
  className,
}: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
        >
          {/* Icon circle */}
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          {/* Text lines */}
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TableSkeleton ─────────────────────────────────────────

/** Props for TableSkeleton */
export interface TableSkeletonProps {
  /** Number of rows (default: 5) */
  rows?: number;
  /** Number of columns (default: 4) */
  columns?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TableSkeleton renders a table-shaped placeholder
 * with a header row and body rows.
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      {/* Header row */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`h-${i}`}
            className="h-3 flex-1"
          />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`r-${rowIdx}`}
          className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={`c-${colIdx}`}
              className={cn(
                'h-3 flex-1',
                // Vary width slightly for realism
                colIdx === 0 && 'max-w-[120px]',
                colIdx === columns - 1 && 'max-w-[80px]'
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── FormSkeleton ──────────────────────────────────────────

/** Props for FormSkeleton */
export interface FormSkeletonProps {
  /** Number of form fields (default: 4) */
  fields?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormSkeleton renders a form-shaped placeholder
 * with label + input patterns.
 */
export function FormSkeleton({
  fields = 4,
  className,
}: FormSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          {/* Label */}
          <Skeleton className="h-3 w-24" />
          {/* Input */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      {/* Submit button */}
      <Skeleton className="h-10 w-32 rounded-md self-start" />
    </div>
  );
}

// ── ChartSkeleton ─────────────────────────────────────────

/** Props for ChartSkeleton */
export interface ChartSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChartSkeleton renders a large rectangular placeholder
 * suitable for chart areas with subtle pulse animation.
 */
export function ChartSkeleton({
  className,
}: ChartSkeletonProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      {/* Chart title */}
      <Skeleton className="h-4 w-32 mb-4" />
      {/* Chart area */}
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
