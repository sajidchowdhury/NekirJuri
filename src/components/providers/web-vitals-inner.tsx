'use client'

// ============================================================
// WebVitalsInner — Actual Web Vitals collection logic
// Separated for dynamic import (avoids Turbopack issues in dev)
// ============================================================

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitalsInner() {
  useReportWebVitals((metric) => {
    const { name, value, rating, navigationType } = metric

    // Log to console in development for debugging
    if (process.env.NODE_ENV === 'development') {
      const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
      console.log(`${emoji} Web Vitals: ${name} = ${value.toFixed(2)}ms (${rating})`)
    }

    // Report to backend endpoint (fire-and-forget)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const payload = JSON.stringify({
          name,
          value: Math.round(value * 100) / 100,
          rating,
          navigationType,
          url: window.location.pathname,
          timestamp: Date.now(),
        })
        navigator.sendBeacon('/api/vitals?XTransformPort=3000', payload)
      } catch {
        // Silently fail
      }
    }
  })

  return null
}
