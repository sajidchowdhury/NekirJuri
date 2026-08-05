#!/usr/bin/env bash
# ============================================================
# Switch Prisma to PRODUCTION mode (PostgreSQL)
# Usage: bun run db:prod
# ============================================================

SCHEMA_FILE="prisma/schema.prisma"

echo "🔄 Switching to PRODUCTION environment (PostgreSQL)..."

# Switch provider to postgresql
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' "$SCHEMA_FILE"

# Backup current .env
cp .env .env.local.bak

# Switch to production .env if available
if [ -f ".env.production" ]; then
  cp .env.production .env
  echo "📝 Loaded .env.production"
else
  echo "⚠️  No .env.production found — please set DATABASE_URL manually"
  echo "   Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
fi

# Generate Prisma client
echo "📦 Generating Prisma client for PostgreSQL..."
bun run db:generate

echo "✅ Production environment ready (PostgreSQL)"
echo "   Run 'bun run db:push' or 'bun run db:migrate' to sync the database"
