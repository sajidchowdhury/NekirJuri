'use client';

// ============================================================
// AuthPattern — Animated Islamic geometric SVG pattern for auth backgrounds
// Slow rotation animation using Framer Motion
// Uses emerald/stone colors from the design system
// ============================================================

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Props for AuthPattern component */
export interface AuthPatternProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * AuthPattern renders a large, slowly rotating Islamic geometric
 * pattern suitable for auth page left panels or backgrounds.
 * Uses the emerald/stone color palette from the design system.
 */
export default function AuthPattern({ className }: AuthPatternProps) {
  return (
    <div className={cn('relative inset-0 overflow-hidden', className)} aria-hidden="true">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 dark:from-emerald-950 dark:via-emerald-900 dark:to-stone-950" />

      {/* Rotating geometric pattern */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            {/* 8-point star pattern tile */}
            <pattern
              id="auth-islamic-pattern"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              {/* Outer diamond */}
              <path
                d="M40 0L80 40L40 80L0 40Z"
                fill="white"
                opacity={0.04}
              />
              {/* Inner diamond (rotated square) */}
              <path
                d="M40 12L68 40L40 68L12 40Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity={0.06}
              />
              {/* 8-point star */}
              <path
                d="M40 16L49.6 30.4L64 40L49.6 49.6L40 64L30.4 49.6L16 40L30.4 30.4Z"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity={0.05}
              />
              {/* Center dot */}
              <circle
                cx="40"
                cy="40"
                r="3"
                fill="white"
                opacity={0.03}
              />
              {/* Corner dots */}
              <circle cx="0" cy="0" r="1.5" fill="white" opacity={0.02} />
              <circle cx="80" cy="0" r="1.5" fill="white" opacity={0.02} />
              <circle cx="0" cy="80" r="1.5" fill="white" opacity={0.02} />
              <circle cx="80" cy="80" r="1.5" fill="white" opacity={0.02} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-islamic-pattern)" />
        </svg>
      </motion.div>

      {/* Additional decorative circles */}
      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/5"
        animate={{ rotate: -360 }}
        transition={{
          duration: 90,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <motion.div
        className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-white/5"
        animate={{ rotate: -360 }}
        transition={{
          duration: 70,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-emerald-800/30 dark:from-stone-950/60 dark:via-transparent dark:to-emerald-950/30" />
    </div>
  );
}
