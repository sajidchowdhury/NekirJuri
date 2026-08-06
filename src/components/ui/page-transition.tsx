'use client';

// ============================================================
// PageTransition — Page transition wrapper using Framer Motion
// Subtle fade + slide up on enter, fade + slide down on exit
// Duration: 0.25s enter, 0.15s exit
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface PageTransitionProps {
  /** Content to wrap with page transition */
  children: React.ReactNode;
  /** Unique key for AnimatePresence (e.g., pathname) */
  key?: string;
}

/** Enter/exit transition variants */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

/** Reduced motion variants (instant, no animation) */
const reducedVariants = {
  initial: { opacity: 1, y: 0 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
  exit: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
};

/**
 * PageTransition wraps children with a subtle page transition
 * animation using Framer Motion AnimatePresence.
 * Respects prefers-reduced-motion.
 */
export default function PageTransition({ children, key }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? reducedVariants : pageVariants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
