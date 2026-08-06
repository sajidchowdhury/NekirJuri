'use client';

// ============================================================
// StatusBadge — Unified status badge with colored dot and label
// Uses statusColors from design-tokens for consistent color mapping
// ============================================================

import { cn } from '@/lib/utils';
import { statusColors, type StatusType } from '@/lib/design-tokens';

/** Props for StatusBadge component */
export interface StatusBadgeProps {
  /** Status type — determines color mapping */
  status: StatusType;
  /** Custom label (defaults to capitalized status) */
  label?: string;
  /** Show colored dot indicator (default: true) */
  showDot?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StatusBadge renders a compact badge with an optional colored dot
 * and text label. Colors are derived from the centralized design-tokens
 * statusColors mapping.
 */
export default function StatusBadge({
  status,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const colors = statusColors[status];
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  );
}
