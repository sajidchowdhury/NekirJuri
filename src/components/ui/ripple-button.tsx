'use client';

// ============================================================
// RippleButton — Button with ripple effect on click
// Wraps shadcn Button with a ripple animation on click
// Also exports useRipple hook for use on any element
// ============================================================

import * as React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Ripple event data */
interface RippleData {
  x: number;
  y: number;
  id: number;
}

/**
 * useRipple — Hook to add ripple effect to any element.
 * Returns: { ripples, addRipple, RippleContainer }
 * - ripples: array of active ripple positions
 * - addRipple: function to trigger a ripple from a MouseEvent
 * - RippleContainer: render fragment to overlay ripples
 */
export function useRipple() {
  const [ripples, setRipples] = React.useState<RippleData[]>([]);

  const addRipple = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 400);
  }, []);

  const RippleContainer = (
    <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute animate-ripple rounded-full bg-current opacity-10"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </span>
  );

  return { ripples, addRipple, RippleContainer };
}

export interface RippleButtonProps extends ButtonProps {
  /** Ripple color class (default: based on variant) */
  rippleColor?: string;
}

/**
 * RippleButton is a drop-in replacement for shadcn Button
 * that adds a material-design-style ripple effect on click.
 */
const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ onClick, className, children, rippleColor, ...props }, ref) => {
    const { addRipple, RippleContainer } = useRipple();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      addRipple(event);
      onClick?.(event);
    };

    // Determine ripple color based on variant if not explicitly set
    const defaultRippleColor =
      props.variant === 'default' || !props.variant
        ? 'text-white'
        : 'text-emerald-700 dark:text-emerald-400';

    const colorClass = rippleColor ?? defaultRippleColor;

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        className={cn('relative overflow-hidden', colorClass, className)}
        {...props}
      >
        {RippleContainer}
        {children}
      </Button>
    );
  }
);

RippleButton.displayName = 'RippleButton';

export { RippleButton };
export default RippleButton;
