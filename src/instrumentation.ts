// ============================================================
// Madrasha ERP SaaS — Next.js Instrumentation Hook
// Runs once on server startup — initializes Sentry
// Sentry is initialized server-side only (not in client bundle)
// to avoid Turbopack compatibility issues with @sentry/nextjs
// ============================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Sentry server-side only if DSN is configured
    if (process.env.SENTRY_DSN) {
      try {
        const Sentry = await import('@sentry/nextjs')
        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
          environment: process.env.NODE_ENV || 'development',
          release: process.env.SENTRY_RELEASE || '0.2.1',
          initialScope: {
            tags: {
              service: 'madrasha-erp',
              component: 'server',
            },
          },
          ignoreErrors: [
            'P2021', // Prisma: Record not found
            'Too many requests',
            'CSRF token validation failed',
          ],
        })
        console.log('[instrumentation] Sentry server-side monitoring active')
      } catch (err) {
        console.warn('[instrumentation] Sentry initialization failed:', err)
      }
    } else {
      console.log('[instrumentation] Sentry not configured (no SENTRY_DSN)')
    }
  }
}
