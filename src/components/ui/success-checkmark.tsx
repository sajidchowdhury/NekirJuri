'use client';

// ============================================================
// SuccessCheckmark — Animated success checkmark (SVG-based)
// Circle draws in (emerald stroke), then checkmark draws in
// Scale bounce at the end (1 → 1.1 → 1)
// Duration: ~0.6s total
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface SuccessCheckmarkProps {
  /** Whether to show the checkmark animation */
  show: boolean;
  /** Size in pixels (default: 48) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SuccessCheckmark renders an SVG circle + checkmark animation.
 * When `show` becomes true: circle draws in, then checkmark draws in
 * with a slight delay, followed by a scale bounce.
 */
export default function SuccessCheckmark({
  show,
  size = 48,
  className,
}: SuccessCheckmarkProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!show) return null;

  // Reduced motion: just show the static checkmark
  if (prefersReducedMotion) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className={cn('text-emerald-600 dark:text-emerald-400', className)}
      >
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M14 24 L20 30 L34 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  const circleLength = 2 * Math.PI * 20; // ~125.66
  const checkLength = 24;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: [0.8, 1.1, 1],
        opacity: 1,
      }}
      transition={{
        scale: { duration: 0.6, times: [0, 0.7, 1], ease: 'easeOut' },
        opacity: { duration: 0.15 },
      }}
      className={cn('inline-flex', className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        className="text-emerald-600 dark:text-emerald-400"
      >
        {/* Circle — draws in on mount */}
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray={circleLength}
          initial={{ strokeDashoffset: circleLength }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />

        {/* Checkmark — draws in after circle (using delay) */}
        <motion.path
          d="M14 24 L20 30 L34 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={checkLength}
          initial={{ strokeDashoffset: checkLength }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
    </motion.div>
  );
}
