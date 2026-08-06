'use client';

// ============================================================
// StatusBadge — Unified status badge with colored dot and label
// Uses statusColors from design-tokens for consistent color mapping
// Phase 11: Added pulse animation for active/paid statuses,
// and pop-in entrance animation for all badges
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { statusColors, type StatusType } from '@/lib/design-tokens';
import { popIn } from '@/lib/animations';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

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
 *
 * Phase 11 enhancements:
 * - Active/paid dots get a pulse animation
 * - Badge entrance uses popIn spring animation
 */
export default function StatusBadge({
  status,
  label,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const colors = statusColors[status];
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);
  const prefersReducedMotion = useReducedMotion();
  const shouldPulse = (status === 'active' || status === 'paid') && !prefersReducedMotion;

  return (
    <motion.span
      variants={popIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      {showDot && (
        shouldPulse ? (
          <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden="true">
            {/* Pulse ring */}
            <motion.span
              className={cn('absolute inset-0 rounded-full', colors.dot)}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Solid dot */}
            <span
              className={cn('relative rounded-full h-1.5 w-1.5', colors.dot)}
            />
          </span>
        ) : (
          <span
            className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors.dot)}
            aria-hidden="true"
          />
        )
      )}
      {displayLabel}
    </motion.span>
  );
}
