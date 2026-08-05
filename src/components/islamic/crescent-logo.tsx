'use client';

// ============================================================
// CrescentLogo — Madrasha ERP logo with crescent moon + star
// Clean, minimal, professional SVG crescent with optional glow animation
// ============================================================

import { cn } from '@/lib/utils';

/** Size mapping in pixels */
const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
} as const;

/** Props for CrescentLogo component */
export interface CrescentLogoProps {
  /** Additional CSS classes */
  className?: string;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Enable subtle glow/pulse animation (default: true) */
  animated?: boolean;
}

/**
 * CrescentLogo renders a crescent moon with a small star
 * in primary emerald color. Clean, minimal, and professional.
 * Optionally animates with a gentle glow pulse.
 */
export default function CrescentLogo({
  className,
  size = 'md',
  animated = true,
}: CrescentLogoProps) {
  const px = sizeMap[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        'text-emerald-700 dark:text-emerald-400',
        animated && 'animate-[crescent-glow_3s_ease-in-out_infinite]',
        className
      )}
      aria-label="Madrasha ERP Logo"
      role="img"
    >
      {/* Crescent moon — two overlapping circles */}
      <circle
        cx="20"
        cy="24"
        r="14"
        fill="currentColor"
        opacity="0.9"
      />
      <circle
        cx="25"
        cy="22"
        r="12"
        fill="white"
        className="dark:fill-stone-900"
      />

      {/* Small star to the upper-right of the crescent */}
      <path
        d="M36 8L37.5 12.5L42 14L37.5 15.5L36 20L34.5 15.5L30 14L34.5 12.5Z"
        fill="currentColor"
        opacity="0.85"
      />

      {/* Tiny secondary star */}
      <path
        d="M32 18L32.8 20.2L35 21L32.8 21.8L32 24L31.2 21.8L29 21L31.2 20.2Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}
