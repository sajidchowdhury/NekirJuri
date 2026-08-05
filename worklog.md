# Work Log — Madrasha ERP Project

---
Task ID: 1
Agent: Main
Task: Set up dual database environment (SQLite for dev, PostgreSQL for prod)

Work Log:
- Converted all Float fields to Decimal (46 instances) for financial precision
- Converted JSON-like String fields to proper Json type (settings, features, value, metadata, oldValues, newValues)
- Set up dual environment: SQLite (dev/preview) + PostgreSQL (production)
- Created .env with SQLite connection for development
- Created .env.production with PostgreSQL connection template
- Created .env.example with documentation for both environments
- Created scripts/switch-to-dev.sh and scripts/switch-to-prod.sh
- Added `db:dev` and `db:prod` scripts to package.json
- Pushed schema to SQLite database — all existing data migrated (Float→Decimal, String→Json)
- Generated Prisma client successfully
- Ran lint check — all clean

Stage Summary:
- Schema version: 2.0 (Dual Environment)
- Dev database: SQLite at file:./db/madrasha.db (works in Z.ai preview)
- Prod database: PostgreSQL (configured via .env.production)
- All monetary fields: Decimal type (no floating-point rounding errors)
- Structured data fields: Json type (settings, features, metadata, audit values)
- Switch commands: `bun run db:dev` (SQLite) / `bun run db:prod` (PostgreSQL)
- Prisma client generated and validated successfully
