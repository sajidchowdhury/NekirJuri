'use client'

// ============================================================
// ErrorBoundary — React Error Boundary with Islamic-themed fallback UI
// Catches render errors and shows a friendly recovery screen
// ============================================================

import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
// Note: Sentry reporting is handled server-side via sentry.server.config.ts
// Client-side error reporting would add @sentry/nextjs to the client bundle
// which is incompatible with Turbopack. Errors are captured via:
// 1. This ErrorBoundary → console.error → server-side Sentry
// 2. Global error endpoint → /api/error-report

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report to server-side error tracking via console.error
    // (Sentry server-side picks up console.error in production)
    console.error('[ErrorBoundary] Caught render error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)

    // Also send to error reporting endpoint (fire-and-forget)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(
          '/api/error-report?XTransformPort=3000',
          JSON.stringify({
            type: 'ErrorBoundary',
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            url: typeof window !== 'undefined' ? window.location.href : '',
            timestamp: Date.now(),
          })
        )
      } catch {
        // Silently fail
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
      }

      return <DefaultErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
    }

    return this.props.children
  }
}

/** Default fallback UI with Islamic-themed design */
function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[400px] gap-6 p-8 overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      {/* Subtle Islamic pattern background */}
      <div
        className="absolute inset-0 islamic-pattern-bg opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Crescent moon icon */}
      <div className="relative z-10 text-6xl" aria-hidden="true">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-emerald-600"
        >
          <path
            d="M40 8C26.745 8 16 18.745 16 32s10.745 24 24 24c4.8 0 9.26-1.41 13-3.84C47.78 55.72 41.18 58 34 58 18.536 58 6 45.464 6 30S18.536 2 34 2c7.18 0 13.78 2.28 19 5.84C49.26 9.41 44.8 8 40 8z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="46" cy="18" r="4" fill="currentColor" opacity="0.7" />
        </svg>
      </div>

      {/* Error message */}
      <div className="relative z-10 flex flex-col items-center gap-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          We apologize for the inconvenience. Please try refreshing the page.
        </p>
      </div>

      {/* Recovery actions */}
      <div className="relative z-10 flex items-center gap-3">
        <Button
          onClick={resetErrorBoundary}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Try Again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>

      {/* Error detail (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="relative z-10 mt-2 max-w-lg w-full">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Error details
          </summary>
          <pre className="mt-2 p-3 rounded-md bg-muted text-xs text-destructive overflow-auto max-h-32">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  )
}

/** HOC to wrap a component with ErrorBoundary */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

export { ErrorBoundary, DefaultErrorFallback }
export default ErrorBoundary
