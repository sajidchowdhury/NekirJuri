#!/usr/bin/env bash
# ============================================================
# Switch Prisma to PRODUCTION mode (PostgreSQL)
# Usage: bun run db:prod
# ============================================================
# This script:
#   1. Switches the Prisma provider to PostgreSQL
#   2. Loads .env.production (or warns if missing)
#   3. Generates the Prisma client for PostgreSQL
#   4. Optionally runs prisma migrate deploy
# ============================================================

set -euo pipefail

SCHEMA_FILE="prisma/schema.prisma"

echo "🔄 Switching to PRODUCTION environment (PostgreSQL)..."

# Step 1: Switch provider to postgresql
sed -i 's/provider = "sqlite"/provider = "postgresql"/g' "$SCHEMA_FILE"
echo "📝 Schema provider set to postgresql"

# Step 2: Backup current .env and load production config
if [ -f ".env" ]; then
  cp .env .env.local.bak
  echo "💾 Backed up current .env → .env.local.bak"
fi

if [ -f ".env.production" ]; then
  cp .env.production .env
  echo "📝 Loaded .env.production → .env"
else
  echo "⚠️  No .env.production found — please set DATABASE_URL manually in .env"
  echo "   Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
fi

# Step 3: Verify DATABASE_URL is set to PostgreSQL
if grep -q "^DATABASE_URL=postgresql://" .env 2>/dev/null; then
  echo "✅ DATABASE_URL is set to PostgreSQL"
else
  echo "⚠️  DATABASE_URL does not appear to be a PostgreSQL connection string"
  echo "   Current value:"
  grep "^DATABASE_URL=" .env 2>/dev/null || echo "   (not set)"
fi

# Step 4: Generate Prisma client for PostgreSQL
echo "📦 Generating Prisma client for PostgreSQL..."
bun run db:generate

echo ""
echo "✅ Production environment ready (PostgreSQL)"
echo ""
echo "Next steps:"
echo "  1. Run migrations:     bun run db:migrate:deploy"
echo "  2. Or push schema:     bun run db:push"
echo "  3. Start the server:   bun run start"
