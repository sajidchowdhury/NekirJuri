'use client';

// ============================================================
// AnimatedCounter — Count-up number animation component
// Animates from 0 to the target value using requestAnimationFrame
// Supports prefix (e.g., "৳") and suffix (e.g., "%")
// Respects prefers-reduced-motion — skips animation if enabled
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface AnimatedCounterProps {
  /** Target number to animate to */
  value: number;
  /** Animation duration in seconds (default: 1.5) */
  duration?: number;
  /** Text prefix (e.g., "৳", "$") */
  prefix?: string;
  /** Text suffix (e.g., "%") */
  suffix?: string;
  /** Number of decimal places (default: 0) */
  decimalPlaces?: number;
  /** Additional CSS classes */
  className?: string;
}

/** Ease-out cubic easing function */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Format number with commas and decimal places */
function formatNumber(num: number, decimalPlaces: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

/**
 * AnimatedCounter animates a number from 0 to the target value
 * using requestAnimationFrame with ease-out cubic easing.
 * Skips animation when prefers-reduced-motion is enabled.
 */
export default function AnimatedCounter({
  value,
  duration = 1.5,
  prefix,
  suffix,
  decimalPlaces = 0,
  className,
}: AnimatedCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      // For reduced motion, schedule state update via rAF
      // to avoid synchronous setState in effect body
      const frameId = requestAnimationFrame(() => {
        setDisplayValue(value);
      });
      return () => cancelAnimationFrame(frameId);
    }

    // Reset for animation
    startTimeRef.current = null;
    const durationMs = duration * 1000;
    const targetValue = value;

    // Start from 0 via rAF to avoid synchronous setState
    const startFrameId = requestAnimationFrame(() => {
      setDisplayValue(0);

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = easedProgress * targetValue;

        setDisplayValue(currentValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(startFrameId);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, prefersReducedMotion]);

  const formattedValue = formatNumber(
    prefersReducedMotion ? value : displayValue,
    decimalPlaces
  );

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
