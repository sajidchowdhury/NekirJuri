'use client';

// ============================================================
// EmptyState — Illustrated empty state component
// Shows large icon, title, description, and optional CTA button
// Fade-in + slide-up animation on mount
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import CrescentLogo from '@/components/islamic/crescent-logo';
import { slideUp, transitions } from '@/lib/animations';

/** Props for EmptyState component */
export interface EmptyStateProps {
  /** Primary message */
  title: string;
  /** Optional description */
  description?: string;
  /** Custom icon node (defaults to CrescentLogo at lg size) */
  icon?: React.ReactNode;
  /** Optional call-to-action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState displays a centered, illustrated empty state
 * with an icon inside an emerald-tinted circle, title,
 * description, and optional CTA button. Animates on mount
 * with fade-in + slide-up.
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 px-6 text-center',
        className
      )}
    >
      {/* Icon area with emerald-tinted circle background */}
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
        {icon ?? <CrescentLogo size="lg" animated={false} />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}

      {/* CTA Button */}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-2"
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
