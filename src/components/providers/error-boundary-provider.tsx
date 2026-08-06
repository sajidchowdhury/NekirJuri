'use client'

// ============================================================
// ErrorBoundaryProvider — App-level error boundary wrapper
// Catches unhandled render errors across the entire application
// ============================================================

import { ErrorBoundary } from '@/components/ui/error-boundary'

export function ErrorBoundaryProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundaryProvider
