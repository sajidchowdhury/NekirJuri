# ============================================================
# Madrasha ERP SaaS — Dockerfile
# Multi-stage build for Next.js + Bun + Prisma + PostgreSQL
# ============================================================
# Supports both SQLite (dev) and PostgreSQL (production) via
# the DATABASE_URL environment variable.
#
# Usage:
#   docker build -t madrasha-erp .
#   docker run -e DATABASE_URL=postgresql://... madrasha-erp
# ============================================================

# ---- Stage 1: Dependencies ----
FROM oven/bun:1.2 AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile
RUN bunx prisma generate

# ---- Stage 2: Build ----
FROM oven/bun:1.2 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js (standalone output)
RUN bun run build

# ---- Stage 3: Production Runner ----
FROM oven/bun:1.2-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema and generated client (needed for migrations at runtime)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy database directory (for SQLite dev mode) and seed script
COPY --from=builder /app/db ./db
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts

# Copy migration scripts
COPY --from=builder /app/scripts ./scripts

# Create necessary directories and set permissions
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db /app/prisma /app/scripts

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# DATABASE_URL is NOT hardcoded here — it MUST be provided at runtime:
#   - For PostgreSQL (production): Pass via docker-compose or -e flag
#   - For SQLite (dev/preview):    Falls back to file:./db/custom.db
ENV DATABASE_URL="file:./db/custom.db"

# Health check: hits /api/health which verifies DB connectivity
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["bun", "server.js"]
