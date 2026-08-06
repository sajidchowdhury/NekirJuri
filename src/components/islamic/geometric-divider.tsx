'use client';

// ============================================================
// GeometricDivider — SVG decorative divider with Islamic geometric motif
// Horizontal line with a diamond/star motif in the center
// ============================================================

import { cn } from '@/lib/utils';

/** Color variant mapping */
const colorMap = {
  primary: 'text-emerald-500 dark:text-emerald-400',
  accent: 'text-amber-500 dark:text-amber-400',
  muted: 'text-stone-300 dark:text-stone-600',
} as const;

/** Props for GeometricDivider component */
export interface GeometricDividerProps {
  /** Additional CSS classes */
  className?: string;
  /** Color variant (default: 'primary') */
  color?: 'primary' | 'accent' | 'muted';
}

/**
 * GeometricDivider renders a horizontal decorative line
 * with an Islamic diamond/star motif centered on the line.
 * Width: 100% of container, height: ~24px.
 */
export default function GeometricDivider({
  className,
  color = 'primary',
}: GeometricDividerProps) {
  return (
    <div
      className={cn('flex items-center justify-center w-full h-6', className)}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="24"
        viewBox="0 0 400 24"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(colorMap[color])}
      >
        {/* Left line */}
        <line
          x1="0"
          y1="12"
          x2="180"
          y2="12"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        {/* Center diamond motif */}
        <path
          d="M190 12L200 4L210 12L200 20Z"
          fill="currentColor"
          opacity="0.6"
        />
        {/* Inner star accent */}
        <path
          d="M195 12L200 8L205 12L200 16Z"
          fill="currentColor"
          opacity="0.3"
        />
        {/* Right line */}
        <line
          x1="220"
          y1="12"
          x2="400"
          y2="12"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
