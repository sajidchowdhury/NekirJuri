# ============================================================
# Madrasha ERP SaaS — Dockerfile
# Multi-stage build for Next.js + Bun + Prisma + SQLite
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

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy database directory (with seed)
COPY --from=builder /app/db ./db
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts

# Create db directory if it doesn't exist and set permissions
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db /app/prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:./db/custom.db"

CMD ["bun", "server.js"]
