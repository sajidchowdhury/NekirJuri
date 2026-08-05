#!/usr/bin/env bash
# ============================================================
# Switch Prisma to DEVELOPMENT mode (SQLite)
# Usage: bun run db:dev
# ============================================================

SCHEMA_FILE="prisma/schema.prisma"

echo "🔄 Switching to DEVELOPMENT environment (SQLite)..."

# Switch provider to sqlite
sed -i 's/provider = "postgresql"/provider = "sqlite"/g' "$SCHEMA_FILE"

# Switch .env to SQLite if .env.production exists
if [ -f ".env.local.bak" ]; then
  cp .env.local.bak .env
  echo "📝 Restored .env from backup"
fi

# Update DATABASE_URL in .env to SQLite
sed -i 's|DATABASE_URL=postgresql://.*|DATABASE_URL=file:./db/madrasha.db|g' .env

# Generate Prisma client
echo "📦 Generating Prisma client for SQLite..."
bun run db:generate

echo "✅ Development environment ready (SQLite)"
echo "   Run 'bun run db:push' to sync the database"
