// ============================================================
// Madrasha ERP SaaS — Structured Logger
// Production: pino JSON logger for log aggregation
// Development: console-based logger (avoids Turbopack issues)
// ============================================================

const isProduction = process.env.NODE_ENV === 'production'
const logLevel = (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')).toLowerCase()

// ============================================================
// Log level priority
// ============================================================

const levels: Record<string, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

const currentLevel = levels[logLevel] ?? levels.info

function shouldLog(level: string): boolean {
  return (levels[level] ?? 0) >= currentLevel
}

// ============================================================
// Structured log entry format
// ============================================================

function formatEntry(level: string, msg: string, obj?: Record<string, unknown>): string {
  if (isProduction) {
    // JSON format for log aggregation
    return JSON.stringify({
      level,
      time: new Date().toISOString(),
      msg,
      service: 'madrasha-erp',
      version: process.env.npm_package_version || '0.2.1',
      env: process.env.NODE_ENV,
      ...obj,
    })
  }
  // Development: human-readable
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false })
  const prefix = `[${timestamp}] ${level.toUpperCase().padEnd(5)}`
  if (obj && Object.keys(obj).length > 0) {
    return `${prefix} ${msg} ${JSON.stringify(obj)}`
  }
  return `${prefix} ${msg}`
}

// ============================================================
// Logger interface
// ============================================================

export interface AppLogger {
  debug(msg: string, obj?: Record<string, unknown>): void
  info(msg: string, obj?: Record<string, unknown>): void
  warn(msg: string, obj?: Record<string, unknown>): void
  error(msg: string, obj?: Record<string, unknown>): void
  child(defaults: Record<string, unknown>): AppLogger
}

// ============================================================
// Logger implementation
// ============================================================

function createLogger(defaults: Record<string, unknown> = {}): AppLogger {
  return {
    debug(msg: string, obj?: Record<string, unknown>) {
      if (shouldLog('debug')) {
        console.debug(formatEntry('debug', msg, { ...defaults, ...obj }))
      }
    },
    info(msg: string, obj?: Record<string, unknown>) {
      if (shouldLog('info')) {
        console.info(formatEntry('info', msg, { ...defaults, ...obj }))
      }
    },
    warn(msg: string, obj?: Record<string, unknown>) {
      if (shouldLog('warn')) {
        console.warn(formatEntry('warn', msg, { ...defaults, ...obj }))
      }
    },
    error(msg: string, obj?: Record<string, unknown>) {
      if (shouldLog('error')) {
        console.error(formatEntry('error', msg, { ...defaults, ...obj }))
      }
    },
    child(moreDefaults: Record<string, unknown>): AppLogger {
      return createLogger({ ...defaults, ...moreDefaults })
    },
  }
}

// ============================================================
// Root logger + convenience child loggers
// ============================================================

export const logger = createLogger()

/** Logger for API route handlers */
export const apiLogger = logger.child({ component: 'api' })

/** Logger for authentication events */
export const authLogger = logger.child({ component: 'auth' })

/** Logger for database operations */
export const dbLogger = logger.child({ component: 'db' })

/** Logger for subscription/billing events */
export const billingLogger = logger.child({ component: 'billing' })

/** Logger for background jobs (cron, backup) */
export const jobLogger = logger.child({ component: 'job' })

/** Logger for security events (rate limit, CSRF, etc.) */
export const securityLogger = logger.child({ component: 'security' })

/** Logger for performance metrics */
export const perfLogger = logger.child({ component: 'perf' })
