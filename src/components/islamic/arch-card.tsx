'use client';

// ============================================================
// ArchCard — Card wrapper with Islamic arch-inspired top border
// Uses shadcn Card internally, adds decorative accent & optional pattern
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from '@/components/ui/card';
import IslamicPattern from '@/components/islamic/islamic-pattern';

/** Props for ArchCard component */
export interface ArchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accent color for the top border (default: 'primary') */
  accentColor?: 'primary' | 'accent';
  /** Show subtle IslamicPattern in card background (default: false) */
  showPattern?: boolean;
}

/**
 * ArchCard wraps shadcn Card with an Islamic arch-inspired decorative
 * top border, optional background pattern, and hover lift animation.
 */
export default function ArchCard({
  accentColor = 'primary',
  showPattern = false,
  className,
  children,
  ...props
}: ArchCardProps) {
  const borderColor = accentColor === 'primary'
    ? 'border-t-emerald-700 dark:border-t-emerald-400'
    : 'border-t-amber-600 dark:border-t-amber-400';

  return (
    <motion.div
      whileHover={{ y: -1, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative"
    >
      {showPattern && (
        <IslamicPattern size="sm" opacity={0.03} className="rounded-xl" />
      )}
      <Card
        className={cn(
          'border-t-[3px]',
          borderColor,
          'transition-shadow duration-150',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}

/** Re-export Card sub-components for convenience */
export { CardContent as ArchCardContent, CardHeader as ArchCardHeader, CardTitle as ArchCardTitle, CardDescription as ArchCardDescription, CardAction as ArchCardAction, CardFooter as ArchCardFooter };
