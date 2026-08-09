'use client'

// ============================================================
// WebVitalsReporter — Collects and reports Core Web Vitals
// Lazy-loaded to avoid Turbopack bundling issues
// Uses Next.js reportWebVitals API
// ============================================================

import dynamic from 'next/dynamic'

// Dynamically import the actual reporter to avoid bundling issues
const WebVitalsInner = dynamic(
  () => import('./web-vitals-inner').then((mod) => mod.WebVitalsInner),
  { ssr: false }
)

export function WebVitalsReporter() {
  // Only render in production (dev mode causes stability issues)
  if (process.env.NODE_ENV !== 'production') return null
  return <WebVitalsInner />
}
