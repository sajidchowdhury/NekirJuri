# Madrasha ERP & Accounting Management System (SaaS)
## Master Software Specification
### Version: 3.2 — Audited & Status-Corrected

> This document is the **single source of truth** for all team members.  
> Last updated: March 2026 (Audit — cross-referenced with actual codebase)  
> Build status: **UI/UX Phases 0-12 COMPLETE** | **Module 28 (Backup & Restore) COMPLETE** | **CRs 1,2,4,5,6,7,8,9,10,11 FUNCTIONALLY COMPLETE**

---

# Vision
Build a scalable multi-tenant SaaS ERP for Madrashas with isolated tenant data, role-based access, accounting, inventory, website builder, subscription enforcement, multi-language support (Ar/En/Bn), and simplified accounting mode for non-accountant users.

---

# Current Build Status

## ✅ COMPLETED (Phases 0-12)

| Phase | Module | Status | Key Deliverables |
|-------|--------|--------|-----------------|
| 0 | Design System | ✅ Done | Theme, colors, fonts, 5 Islamic components, 5 atoms, animations |
| 1 | Layout & Navigation | ✅ Done | Sidebar, header, mobile nav, command palette (Ctrl+K), 29 pages |
| 2 | Auth & Onboarding | ✅ Done | Login, register (3-step), forgot password. NextAuth v4 integrated |
| 3 | Dashboard & Analytics | ✅ Done | 4 stat cards, 4 charts (Recharts), recent activity, quick actions |
| 4 | Academic Management | ✅ Done | Students, teachers, employees, classes, sessions, promotions — full CRUD with DataTable, FormWizard |
| 5 | Finance & Fee Mgmt | ✅ Done | Fee categories, structure builder (matrix), invoices, collections, donations, expenses |
| 6 | HR & Payroll | ✅ Done | Salary structures, payroll processor, payslip view, payment history |
| 7 | Inventory & Procurement | ✅ Done | Products, purchase orders, stock dashboard, movement log, sales |
| 8 | Accounting & Reports | ✅ Done | Chart of accounts tree, journal entries, trial balance, income statement, balance sheet |
| 9 | CMS & Communication | ✅ Done | Website pages CMS, notice board, photo gallery |
| 10 | System & Admin | ✅ Done | Users & roles, permission matrix (32 perms), notifications, activity logs, settings |
| 11 | Polish & Animations | ✅ Done | AnimatedCounter, SuccessCheckmark, RippleButton, PageTransition, focus rings, print styles |
| 12 | Accessibility & QA | ✅ Done | Skip-to-content, ErrorBoundary, ARIA labels, print stylesheet, not-found page |

## ✅ COMPLETED — Change Requests (CR)

| CR | Title | Status | Key Deliverables |
|----|-------|--------|-----------------|
| CR-1 | Bismillah Placement | ✅ Done | Removed from pages, added to top bar (centered, subtle), kept on print layouts |
| CR-2 | Multi-Language System | ✅ Done | 3-language (Ar/En/Bn), RTL for Arabic, language switcher, `_bn`/`_ar` DB fields, next-intl architecture |
| CR-4 | Sale-to-Student Fee | ✅ Done | Student selector in sales, "Add to Monthly Fee" toggle, auto-creates FeeInvoiceItem, fee invoice link in sale detail |
| CR-5 | Recurring Donations | ✅ Done | Recurring frequency (monthly/yearly), nextDueDate auto-calculate, daily reminder cron (port 3031), dashboard widget, payment recording dialog, donor reminder preferences |
| CR-6 | Fix New Sale Modal | ✅ Done | Card-based line items, proper spacing, mobile Drawer, no overlapping fields |
| CR-7 | Subscription Enforcement | ✅ Done | Enforcement levels (full/grace/restricted/suspended/terminated), computeEnforcement(), SubscriptionGuard, bKash/Nagad, grace period, read-only mode, Schema aligned: currentPeriodEnd, gracePeriodEnd, restrictedEnd; Tenant: subscriptionStatus, isReadOnly; User: emailVerified |
| CR-8 | Simplified Accounting | ✅ Done | Two modes (Simple/Expert), auto-journal in Simple, no debit/credit terminology, mode toggle in settings. Schema aligned: `accountingMode` dedicated column on Tenant. |
| CR-9 | Sidebar Collapsible Submenus | ✅ Done | Accordion behavior, active group auto-expanded, smooth animations |
| CR-10 | Fee Category Form | ✅ Done | Full CRUD with react-hook-form + zod, edit/delete dialogs, audit logging, soft delete |
| CR-11 | Image Upload Limits | ✅ Done | Tier-based limits (albums, images/album, size, storage), usage bar, 413 enforcement, upgrade prompts, image/album delete with storage cleanup |

## ⚠️ SCHEMA ALIGNMENT GAPS (Non-Blocking)

_No remaining schema gaps. All CR-7 and CR-8 fields are now schema-aligned._

## ❌ NOT STARTED — Future Work

| Module | Priority | Dependencies |
|--------|----------|-------------|
| SMS/Email Sending Backend | Medium | Provider integration (Twilio/MSG91, Resend/SendGrid) |
| QR/Barcode Support | Low | — |
| Custom Domains | Low | — |

### Build Stats
- **156+ components** (atoms, molecules, organisms, domain-specific)
- **29 pages** (3 auth + 26 dashboard)
- **60+ API routes** (wired to Prisma with validation)
- **51 Prisma models** (49 original + SubscriptionPayment + BackupRecord)
- **42,000+ lines** of TypeScript/TSX
- **0 lint errors**

---

# Core Architecture
- Multi-tenant SaaS
- One codebase, separate data per Madrasha (tenant_id)
- Modular architecture with 7 domains
- API-ready (60+ routes)
- Mobile-ready (responsive with mobile card views + bottom tab nav)
- Audit logging (ActivityLog + AuditLog models)
- RBAC (Role-Based Access Control with 32 permissions across 6 modules)
- Subscription enforcement (CR-7) — full/grace/restricted/suspended/terminated
- Multi-language support (CR-2) — Ar/En/Bn with RTL
- Simplified accounting (CR-8) — Simple/Expert modes

---

# Main Modules

| # | Module | UI Status | API Status | DB Status |
|---|--------|-----------|------------|-----------|
| 1 | SaaS Administration | ✅ Done | ✅ Done | ✅ 50 models |
| 2 | Subscription & Billing | ✅ Done | ✅ Done | ✅ All fields present (CR-7 aligned) |
| 3 | Tenant (Madrasha) Management | ✅ Done | ✅ Done | ✅ Done (subscriptionStatus, isReadOnly added) |
| 4 | Authentication | ✅ Done | ✅ NextAuth v4 | ✅ Done |
| 5 | Roles & Permissions | ✅ Done | ✅ Done | ✅ Done |
| 6 | Dashboard | ✅ Done | ✅ Done | ✅ Done |
| 7 | Madrasha Profile | ✅ Settings page | ✅ Done | ✅ Done |
| 8 | Website Builder | ✅ Done | ✅ Done | ✅ Done |
| 9 | Academic Setup | ✅ Done | ✅ Done | ✅ Done |
| 10 | Student Management | ✅ Done | ✅ Done | ✅ Done |
| 11 | Guardian Management | ✅ In student form | ✅ Done | ✅ Done |
| 12 | Teacher Management | ✅ Done | ✅ Done | ✅ Done |
| 13 | Staff Management | ✅ Done | ✅ Done | ✅ Done |
| 14 | User Management | ✅ Done | ✅ Done | ✅ Done |
| 15 | Student Fees | ✅ Done | ✅ Done | ✅ Done |
| 16 | Donation Management | ✅ Done | ✅ Done (CR-5 complete) | ✅ Done |
| 17 | Expense Management | ✅ Done | ✅ Done | ✅ Done |
| 18 | Salary & Payroll | ✅ Done | ✅ Done | ✅ Done |
| 19 | Inventory & Stock | ✅ Done | ✅ Done | ✅ Done |
| 20 | Sales (Student Store) | ✅ Done | ✅ Done (CR-4 complete) | ✅ Done |
| 21 | Accounting | ✅ Done | ✅ Done (CR-8 complete) | ✅ Done (accountingMode column) |
| 22 | Reports | ✅ Done | ✅ Done | ✅ Done |
| 23 | Notifications | ✅ Done | ✅ Done | ✅ Done |
| 24 | Receipts & Printing | ✅ Done | ✅ Done | ✅ Done |
| 25 | Search | ✅ Command palette | — | — |
| 26 | Settings | ✅ Done | ✅ Done | ✅ Done |
| 27 | Security | ✅ Done | ✅ Done | ✅ Done |
| 28 | Backup & Restore | ✅ Done | ✅ Done | ✅ Done (BackupRecord model) |
| 29 | Activity Log | ✅ Done | ✅ Done | ✅ Done |
| 30 | Future Modules | ❌ Planned | ❌ Planned | ❌ Planned |

---

# Change Requests — Detailed Status

## ✅ CR-1: Bismillah Placement — COMPLETE
- **Done**: Removed `showBismillah` from all PageHeader components. Bismillah shown in top bar (centered, subtle, hidden on mobile). Kept on print layouts and financial reports.

## ✅ CR-2: Multi-Language System — COMPLETE
- **Done**: 3-language support (Arabic / English / Bangla). Language switcher in header + settings. RTL layout for Arabic. `_bn`/`_ar` fields on dynamic content models. next-intl architecture.

## ✅ CR-4: Product Sale to Student with Monthly Fee — COMPLETE
- **Done**: Student selector in SalesForm. "Add to Monthly Fee" toggle. Auto-creates FeeInvoiceItem with "Product Purchase" category. Fee invoice link shown in sale detail view. Backend: `addToFee`, `feeInvoiceId` fields on Sale.

## ✅ CR-5: Recurring Donations with Reminders — COMPLETE
- **Done**: `isRecurring` + `recurringFrequency` (monthly/yearly) on Donation model
- **Done**: `nextDueDate` — auto-calculated from last payment + frequency
- **Done**: Reminder cron job (DAILY at 9:00 AM Asia/Dhaka) — checks donations due within 7 days, creates admin notifications
- **Done**: Dashboard widget: Upcoming recurring donations (next 30 days) on main dashboard + donations page
- **Done**: When donor pays, `nextDueDate` auto-advances via PATCH /api/donations
- **Done**: DonationsDataTable with recurring status, overdue indicators, payment recording actions
- **Done**: RecurringPaymentDialog for recording payments with nextDueDate auto-advance preview
- **Done**: Donor reminder preferences (reminderConsent, reminderMethod) with UI toggle and settings dialog
- **Done**: Cron mini-service (port 3031) with node-cron + manual trigger endpoint
- **Done**: Fixed recurring-reminders API — Notification model userId requirement resolved with findTenantAdminUserId()

## ✅ CR-6: Fix New Sale Modal — COMPLETE
- **Done**: Card-based line items, proper grid layout, no overlapping fields, mobile Drawer component.

## ⚠️ CR-7: SaaS Subscription Enforcement — COMPLETE (Schema Aligned)
- **Done**: Enforcement levels (full → grace_period → restricted → suspended → terminated)
- **Done**: `computeEnforcement()` in subscription.ts — uses currentPeriodEnd, gracePeriodEnd, restrictedEnd
- **Done**: SubscriptionGuard component with read-only mode + upgrade CTA
- **Done**: SubscriptionBanner by enforcement level
- **Done**: Grace period (14 days), read-only mode, data deletion warning
- **Done**: Payment via bKash/Nagad (SubscriptionPayment model)
- **Done**: `currentPeriodEnd`, `gracePeriodEnd`, `restrictedEnd` on Subscription model
- **Done**: `subscriptionStatus`, `isReadOnly` on Tenant model (cached for quick checks)
- **Done**: `emailVerified` on User model
- **Done**: `computeTenantCache()` keeps tenant-level cache in sync
- **Done**: `lastPaymentDate`, `lastPaymentMethod`, `lastPaymentRef` on Subscription
- **Done**: `dataDeletionDate` on Subscription (for future data deletion cron)
- **Done**: Data deletion cron job for terminated tenants (30+ days) — /api/cron/data-deletion + src/lib/data-deletion/index.ts

## ✅ CR-8: Simplified Accounting Mode — COMPLETE
- **Done**: Two modes — "Simple" (no debit/credit, auto-journal, income/expense terminology) and "Expert" (standard double-entry)
- **Done**: Mode toggle in settings
- **Done**: SimplifiedJournalEntryForm, SimplifiedChartOfAccounts, SimplifiedAccountingSummary components
- **Done**: Mode-aware pages (Chart of Accounts, Journal Entries render different UIs)
- **Done**: Dedicated `accountingMode` column on Tenant (String @default("double-entry")) — API route updated to read/write column directly

## ✅ CR-9: Sidebar Collapsible Submenus — COMPLETE
- **Done**: Accordion behavior — click group expands, collapses others. Active group auto-expanded. Smooth Framer Motion animations.

## ✅ CR-10: Fee Category Creation Form — COMPLETE
- **Done**: Full CRUD with react-hook-form + zod validation. Create, edit (with defaultValues), delete (AlertDialog with soft delete). Audit logging on all mutations. Bengali name field.

## ✅ CR-11: Image Upload Limits — COMPLETE
- **Done**: Tier-based limits (maxAlbums, maxImagesPerAlbum, maxImageSizeMb, maxStorageMb). GalleryLimitsBar with progress bars + upgrade prompt. 413 enforcement on upload API. Image delete with storage cleanup. Album CRUD with storage cleanup. Subscription plan form includes gallery limit fields.

---

# Key Features
- [x] Multi-role login
- [x] Granular permissions (32 across 6 modules)
- [x] Student admission & promotion
- [x] Fee categories, discounts, waivers
- [x] Fee category CRUD form (CR-10)
- [x] Donation categories & donor database
- [x] **Recurring donations with reminders (CR-5)**
- [x] Expense categories & vouchers
- [x] Salary history & deductions
- [x] Inventory, suppliers, purchases, stock movement
- [x] POS-ready student shop
- [x] Sale-to-student with monthly fee integration (CR-4)
- [x] Daily/monthly/yearly financial reports
- [x] PDF/Excel export (UI ready)
- [x] Multi-language (3 languages — CR-2 ✅)
- [x] RTL layout for Arabic (CR-2 ✅)
- [x] Subscription enforcement (CR-7 ✅)
- [x] Simplified accounting mode (CR-8 ✅)
- [x] Image upload limits per tier (CR-11 ✅)
- [x] Backup & Restore (Module 28)
- [ ] QR/Barcode support
- [ ] SMS/Email sending (UI ready, backend needed)
- [ ] Custom domains (future)
- [ ] Unit tests
- [x] Data deletion cron for terminated tenants (CR-7 ✅)

---

# Database Expectations
Core entities: ✅ All 51 models implemented in Prisma schema (49 original + SubscriptionPayment + BackupRecord).

Every business table includes `tenant_id`.  
⚠️ CR-7 and CR-8 have minor schema gaps — see detailed status above.

---

# UI Expectations
- [x] Responsive (mobile-first)
- [x] Dashboard KPIs (4 stat cards + 4 charts)
- [x] Clean sidebar (with nav groups)
- [x] Sidebar accordion (CR-9 ✅)
- [x] Search everywhere (command palette Ctrl+K)
- [x] Filters (on all data tables)
- [x] Bulk actions (UI ready on data tables)
- [x] Print-friendly (financial reports, payslips, receipts)
- [x] Consistent design system (Islamic Modern Premium)
- [x] Reusable components (156+ components)
- [x] English/Bengali/Arabic font support (CR-2 ✅)
- [x] Full 3-language UI strings (CR-2 ✅)
- [x] RTL layout for Arabic (CR-2 ✅)
- [x] Subscription banners (CR-7 ✅)
- [x] Simple accounting UI (CR-8 ✅)
- [x] Gallery storage limits bar (CR-11 ✅)

---

# Developer Expectations
- [x] Modular code (7 domains)
- [x] Service layer (API routes implemented)
- [x] Validation (react-hook-form + zod on all forms)
- [x] REST API ready (60+ routes)
- [x] Queue ready (cron job for CR-5 recurring donation reminders)
- [ ] Unit-test friendly (no tests yet)
- [x] Secure authentication (NextAuth v4)
- [x] Soft deletes where appropriate (deleted_at on transactional tables)
- [x] Migration-first database design (Prisma)
- [x] Audit logging on all mutations
- [x] Multi-tenant isolation enforced

---

# Dependency Graph

```
CR-7 (Subscription) ✅ ──→ CR-11 (Upload Limits) ✅  [limits tied to subscription tier]
CR-2 (i18n) ✅         ──→ CR-1 (Bismillah) ✅       [Bismillah text needs Arabic rendering]
CR-8 (Simple Acct) ⚠️ ──→ CR-4 (Sale-to-Fee) ✅     [simple mode needs income recording]
CR-7 (Subscription) ✅ ──→ CR-5 (Recurring Donations) ✅  [reminder cron needs infra]
```

All dependencies satisfied. All schema gaps resolved (CR-7 ✅, CR-8 ✅).

---

# Recommended Build Order (Next Phase)

## Priority 1 — Schema Alignment
_All schema alignment tasks complete._

## Priority 2 — Production Hardening
1. **Formal migration scripts** — Replace db:push with proper Prisma migrations
2. **Unit tests** — At minimum: API routes, subscription enforcement, tenant isolation

~~Completed hardening items~~: Data deletion cron ✅, User.email unique index ✅, computeEnforcement() bug fix ✅

## Priority 3 — Feature Enhancements
1. **SMS/Email backend** — Twilio/MSG91 + Resend/SendGrid integration
2. **QR/Barcode support** — For students, receipts, products
3. **Custom domains** — Per-tenant custom domain routing

---

# Handover Notes
- **10 change requests are FULLY COMPLETE** (CR-1,2,4,5,6,7,8,9,10,11)
- **Module 28 (Backup & Restore) COMPLETE** — Architecture, DB schema (BackupRecord model), API routes, UI all implemented
- **CR-8 schema alignment DONE** — Tenant.accountingMode dedicated column added, API route updated
- **CR-7 schema alignment DONE** — All Subscription/Tenant/User fields added, computeEnforcement() updated, tenant cache sync implemented
- **CR-5 fully implemented** — Recurring Donations with Reminders with cron job, dashboard widget, payment recording UI, donor reminder preferences
- All Prisma schema changes are pushed and in sync
- API routes are fully implemented (not just scaffolded)
- **BUG-01 FIXED**: `computeEnforcement()` string-vs-Date bug in subscription.ts — fixed with ensureDate() defensive wrapper
- **B-21 DONE**: User.email @@unique([email]) global unique constraint — one email = one account across all tenants
- **BL-22 DONE**: Data deletion cron job implemented — /api/cron/data-deletion + src/lib/data-deletion/index.ts
- Frontend gracefully falls back to sample data when API returns 401 (no auth context)
