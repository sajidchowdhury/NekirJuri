import { PrismaClient } from '@prisma/client'
import { dbLogger } from '@/lib/logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Conditional logging: query logs only in development, warnings/errors in production
const logConfig =
  process.env.NODE_ENV === 'production'
    ? ['warn', 'error'] as const
    : ['query', 'warn', 'error'] as const

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logConfig,
  })

// In development, cache the Prisma client to prevent hot-reload from
// creating multiple connections. In production, this is skipped.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Graceful shutdown: disconnect Prisma when the process exits
// This prevents dangling DB connections, especially with PostgreSQL connection pools.
const gracefulShutdown = async (signal: string) => {
  dbLogger.info({ signal }, 'Received shutdown signal, closing database connections')
  try {
    await db.$disconnect()
    dbLogger.info('Database connections closed successfully')
    process.exit(0)
  } catch (err) {
    dbLogger.error({ err }, 'Error closing database connections')
    process.exit(1)
  }
}

// Only register shutdown handlers in production (in dev, Next.js hot-reload manages lifecycle)
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}
