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
