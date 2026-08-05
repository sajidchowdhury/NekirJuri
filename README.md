# Madrasha ERP & Accounting Management System (SaaS)

Multi-tenant SaaS ERP for Madrashas with isolated tenant data, role-based access, accounting, inventory, website builder, and modular architecture.

## 🚀 Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/sajidchowdhury/NekirJuri.git
cd NekirJuri

# 2. Copy environment config
cp .env.example .env

# 3. Build and run with Docker Compose
docker-compose up -d --build

# 4. Visit the app
# Open http://localhost:3000 in your browser
```

## 🛠️ Local Development (without Docker)

```bash
# Prerequisites: Bun runtime (https://bun.sh)

# 1. Install dependencies
bun install

# 2. Generate Prisma client
bun run db:generate

# 3. Push database schema
bun run db:push

# 4. Seed the database with sample data
bun run db:seed

# 5. Start development server
bun run dev
```

## 📊 Seed Data

After seeding, you'll have:
- **1 Demo Madrasha**: Jamia Islamia Darul Uloom
- **3 Users**: super-admin, admin, accountant
- **30 Students**, **5 Teachers**, **10 Classes**, **15 Sections**
- **44 Permissions** with full RBAC
- **Fee invoices**, **donations**, **expenses**, **salary structures**
- **21 Chart of Accounts** entries

## 🗄️ Database

- **Engine**: SQLite (via Prisma ORM)
- **Tables**: 46 tables across 7 domains
- **Domains**: SaaS, Security, Academic, Finance, Inventory, CMS, System
- **Seed**: `bun run db:seed`

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema (46 tables)
│   └── seed.ts          # Seed script
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/ui/   # shadcn/ui components
│   └── lib/
│       ├── db.ts        # Prisma client
│       └── utils.ts     # Utilities
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Docker Compose config
└── .env.example         # Environment template
```
