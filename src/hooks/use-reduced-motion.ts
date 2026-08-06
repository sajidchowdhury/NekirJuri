'use client';

// ============================================================
// useReducedMotion — Detect prefers-reduced-motion media query
// Returns true if the user prefers reduced motion
// All animations should check this hook to respect accessibility
// ============================================================

import { useSyncExternalStore } from 'react';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

/**
 * Hook to detect if the user prefers reduced motion.
 * Uses `window.matchMedia('(prefers-reduced-motion: reduce)')`.
 * Returns `true` if the user has enabled reduced motion in their OS settings.
 * Uses useSyncExternalStore for safe concurrent rendering.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
