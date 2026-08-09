import { PrismaClient } from '@prisma/client'

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
  console.log(`\n📴 Received ${signal}. Closing database connections...`)
  try {
    await db.$disconnect()
    console.log('✅ Database connections closed.')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error closing database connections:', err)
    process.exit(1)
  }
}

// Only register shutdown handlers in production (in dev, Next.js hot-reload manages lifecycle)
if (process.env.NODE_ENV === 'production') {
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}
