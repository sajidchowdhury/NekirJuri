'use client';

// ============================================================
// IslamicPattern — SVG-based Islamic geometric pattern overlay
// Renders an 8-point star / diamond repeating pattern
// Used as a decorative background overlay (absolute, pointer-events-none)
// ============================================================

import { cn } from '@/lib/utils';

/** Size mapping for pattern tile dimensions */
const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
} as const;

/** Props for IslamicPattern component */
export interface IslamicPatternProps {
  /** Additional CSS classes */
  className?: string;
  /** Pattern opacity (default: 0.06) */
  opacity?: number;
  /** Tile size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
  /** Enable slow rotation animation (default: false) */
  animated?: boolean;
}

/**
 * IslamicPattern renders a repeating SVG geometric pattern
 * with 8-point star and diamond motifs. Uses `currentColor`
 * to inherit color from parent (typically emerald green).
 */
export default function IslamicPattern({
  className,
  opacity = 0.06,
  size = 'md',
  animated = false,
}: IslamicPatternProps) {
  const tileSize = sizeMap[size];

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden',
        animated && 'animate-[islamic-rotate_60s_infinite_linear]',
        className
      )}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          'absolute inset-0 w-full h-full',
          animated && 'animate-[islamic-rotate_60s_infinite_linear]'
        )}
      >
        <defs>
          {/* 8-point star pattern tile */}
          <pattern
            id="islamic-pattern"
            x="0"
            y="0"
            width={tileSize}
            height={tileSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Outer diamond */}
            <path
              d={`M${tileSize / 2} 0L${tileSize} ${tileSize / 2}L${tileSize / 2} ${tileSize}L0 ${tileSize / 2}Z`}
              fill="currentColor"
              opacity={opacity}
            />
            {/* Inner diamond (rotated square) */}
            <path
              d={`M${tileSize / 2} ${tileSize * 0.15}L${tileSize * 0.85} ${tileSize / 2}L${tileSize / 2} ${tileSize * 0.85}L${tileSize * 0.15} ${tileSize / 2}Z`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity={opacity * 1.5}
            />
            {/* 8-point star — central star motif */}
            <path
              d={`
                M${tileSize / 2} ${tileSize * 0.2}
                L${tileSize * 0.62} ${tileSize * 0.38}
                L${tileSize * 0.8} ${tileSize / 2}
                L${tileSize * 0.62} ${tileSize * 0.62}
                L${tileSize / 2} ${tileSize * 0.8}
                L${tileSize * 0.38} ${tileSize * 0.62}
                L${tileSize * 0.2} ${tileSize / 2}
                L${tileSize * 0.38} ${tileSize * 0.38}
                Z
              `}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity={opacity * 1.2}
            />
            {/* Small circle at center */}
            <circle
              cx={tileSize / 2}
              cy={tileSize / 2}
              r={tileSize * 0.06}
              fill="currentColor"
              opacity={opacity * 0.8}
            />
            {/* Corner dots for connectivity */}
            <circle cx="0" cy="0" r={tileSize * 0.02} fill="currentColor" opacity={opacity * 0.6} />
            <circle cx={tileSize} cy="0" r={tileSize * 0.02} fill="currentColor" opacity={opacity * 0.6} />
            <circle cx="0" cy={tileSize} r={tileSize * 0.02} fill="currentColor" opacity={opacity * 0.6} />
            <circle cx={tileSize} cy={tileSize} r={tileSize * 0.02} fill="currentColor" opacity={opacity * 0.6} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>
    </div>
  );
}
