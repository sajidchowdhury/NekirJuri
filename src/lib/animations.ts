// ============================================================
// Madrasha ERP — Shared Framer Motion Animation Variants
// Centralized animation definitions for consistent motion design
// ============================================================

import type { Variants } from "framer-motion";

/** Fade in from transparent */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Slide up from below with fade */
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

/** Scale in from slightly smaller with fade */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/** Stagger children with 0.1s delay between each */
export const staggerChildren: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/** Full page transition with enter and exit states */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/** Transition configs for reuse in Framer Motion `transition` prop */
export const transitions = {
  fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
  normal: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  slow: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
} as const;

// ============================================================
// Phase 11 — Additional animation variants
// ============================================================

/** Slide in from left (for sidebar, drawers) */
export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

/** Slide in from right (for sheets, modals) */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

/** Pop in with spring (for badges, notifications) */
export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  exit: { opacity: 0, scale: 0.8 },
};

/** Shimmer effect for loading skeletons */
export const shimmerTransition = {
  repeat: Infinity,
  duration: 1.5,
  ease: 'linear',
};

/** Stagger with 0.05s delay (faster stagger for lists) */
export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/** Stagger with 0.15s delay (slower for hero sections) */
export const staggerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};
