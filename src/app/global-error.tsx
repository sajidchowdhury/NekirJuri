'use client'

// ============================================================
// Global Error Boundary — Catches root-level errors
// This is the outermost error boundary in Next.js App Router
// Must be a Client Component and define its own <html> and <body>
// Sentry reporting is handled server-side (not in client bundle)
// ============================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log to console (server-side Sentry picks this up)
  console.error('[GlobalError] Unhandled error:', error)

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <div style={{ fontSize: '3rem', lineHeight: 1 }}>
          ⚠️
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ margin: 0, color: '#7f1d1d', maxWidth: '400px', textAlign: 'center' }}>
          An unexpected error occurred. Our team has been notified.
          Please try refreshing the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: '#065f46',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Try Again
        </button>
        {error.digest && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626', marginTop: '0.5rem' }}>
            Error ID: {error.digest}
          </p>
        )}
      </body>
    </html>
  )
}
