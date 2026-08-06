# Madrasha ERP & Accounting Management System (SaaS)
## Master Software Specification
### Version: 2.0 — Post Phase 12 Update

> This document is the **single source of truth** for all team members.  
> Last updated: August 2025  
> Build status: **UI/UX Phases 0-12 COMPLETE** | Backend API scaffold COMPLETE | New requirements pending

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

### Build Stats
- **156 components** (atoms, molecules, organisms, domain-specific)
- **29 pages** (3 auth + 26 dashboard)
- **54 API routes** (scaffolded)
- **49 Prisma models** (7 domains)
- **40,563 lines** of TypeScript/TSX
- **0 lint errors**

---

# Core Architecture
- Multi-tenant SaaS
- One codebase, separate data per Madrasha (tenant_id)
- Modular architecture with 7 domains
- API-ready (54 routes scaffolded)
- Mobile-ready (responsive with mobile card views + bottom tab nav)
- Audit logging (ActivityLog + AuditLog models)
- RBAC (Role-Based Access Control with 32 permissions across 6 modules)

---

# Main Modules

| # | Module | UI Status | API Status | DB Status |
|---|--------|-----------|------------|-----------|
| 1 | SaaS Administration | ✅ Done | ✅ Scaffolded | ✅ 49 models |
| 2 | Subscription & Billing | ⚠️ Partial | ⚠️ Scaffolded | ⚠️ Needs enforcement |
| 3 | Tenant (Madrasha) Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 4 | Authentication | ✅ Done | ✅ NextAuth v4 | ✅ Done |
| 5 | Roles & Permissions | ✅ Done | ✅ Scaffolded | ✅ Done |
| 6 | Dashboard | ✅ Done | ✅ Done | ✅ Done |
| 7 | Madrasha Profile | ✅ Settings page | ⚠️ Scaffolded | ✅ Done |
| 8 | Website Builder | ✅ Done | ✅ Scaffolded | ✅ Done |
| 9 | Academic Setup | ✅ Done | ✅ Scaffolded | ✅ Done |
| 10 | Student Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 11 | Guardian Management | ✅ In student form | ✅ Scaffolded | ✅ Done |
| 12 | Teacher Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 13 | Staff Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 14 | User Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 15 | Student Fees | ✅ Done | ✅ Scaffolded | ✅ Done |
| 16 | Donation Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 17 | Expense Management | ✅ Done | ✅ Scaffolded | ✅ Done |
| 18 | Salary & Payroll | ✅ Done | ✅ Scaffolded | ✅ Done |
| 19 | Inventory & Stock | ✅ Done | ✅ Scaffolded | ✅ Done |
| 20 | Sales (Student Store) | ✅ Done | ✅ Scaffolded | ✅ Done |
| 21 | Accounting | ✅ Done | ✅ Scaffolded | ✅ Done |
| 22 | Reports | ✅ Done | ✅ Scaffolded | ✅ Done |
| 23 | Notifications | ✅ Done | ✅ Scaffolded | ✅ Done |
| 24 | Receipts & Printing | ✅ Done | ✅ Scaffolded | ✅ Done |
| 25 | Search | ✅ Command palette | — | — |
| 26 | Settings | ✅ Done | ✅ Scaffolded | ✅ Done |
| 27 | Security | ⚠️ Partial | ⚠️ Scaffolded | ✅ Done |
| 28 | Backup & Restore | ❌ Not started | ❌ Not started | ❌ Not started |
| 29 | Activity Log | ✅ Done | ✅ Scaffolded | ✅ Done |
| 30 | Future Modules | ❌ Planned | ❌ Planned | ❌ Planned |

---

# 🔴 NEW REQUIREMENTS (Post Phase 12)

## CR-1: Bismillah Placement
- **Current**: BismillahHeader on every page via `PageHeader showBismillah`
- **Required**: Remove from individual pages. Show ONLY in top bar (centered, subtle). Keep on print layouts.
- **Category**: UI/UX + Frontend

## CR-2: Multi-Language System (Arabic / English / Bangla)
- **Current**: English only, Bengali font loaded but not used for UI strings
- **Required**: Full 3-language system. Default: English. User can switch from Settings.
- **Scope**: Architecture + Database + Backend + UI/UX + Frontend
- **Details**: ~800 translation strings, RTL for Arabic, dynamic content needs `_bn`/`_ar` DB fields
- **Category**: ALL departments

## CR-4: Product Sale to Student with Monthly Fee Payment
- **Current**: Sales are standalone, no link to student fee system
- **Required**: When selling to a student, option to "Add to Monthly Fee" — item appears in Fee Collections
- **Category**: Architect + DB + Backend + Frontend

## CR-5: Recurring Donations with Reminders
- **Current**: Donations are one-time only
- **Required**: Donor can pledge monthly/yearly. System sends reminders 7 days before due date.
- **Category**: Architect + DB + Backend + Frontend

## CR-6: Fix New Sale Modal
- **Current**: Product and Qty fields overlapping, not mobile-friendly
- **Required**: Fix layout, card-based line items, Drawer on mobile
- **Category**: UI/UX + Frontend

## CR-7: SaaS Subscription Enforcement (CRITICAL)
- **Current**: Subscription model exists in DB but no enforcement logic
- **Required**: 
  - Payment via bKash/Nagad
  - Plans: 1 month / 6 months / 12 months
  - Grace period: 14 days after due → full access with warning
  - Restricted: 15-30 days → admin only login, READ-ONLY
  - Suspended: 31-59 days → data deletion warning
  - Terminated: 60+ days → data deleted, admin can still login
  - Single email = single account (enforced)
- **Category**: Architect + DB + Backend + UI/UX + Frontend

## CR-8: Simplified Accounting Mode
- **Current**: Full double-entry accounting only
- **Required**: Two modes — "Simple" (no debit/credit terminology, auto-journal) and "Expert" (current). Default: Simple.
- **Category**: Architect + DB + Backend + UI/UX + Frontend

## CR-9: Sidebar Collapsible Submenus
- **Current**: All groups always expanded
- **Required**: Accordion behavior — click group expands it, collapses others. Active group auto-expanded.
- **Category**: UI/UX + Frontend

## CR-10: Fee Category Creation Form
- **Current**: Placeholder message "available in next update"
- **Required**: Full CRUD form with react-hook-form + zod
- **Category**: Backend + UI/UX + Frontend

## CR-11: Image Upload Limits
- **Current**: No limits on gallery uploads
- **Required**: Tier-based limits (albums, images/album, image size, total storage). Show usage bar. Upgrade prompt when limits hit.
- **Category**: Architect + DB + Backend + Frontend

---

# Key Features
- [x] Multi-role login
- [x] Granular permissions (32 across 6 modules)
- [x] Student admission & promotion
- [x] Fee categories, discounts, waivers
- [x] Donation categories & donor database
- [x] Expense categories & vouchers
- [x] Salary history & deductions
- [x] Inventory, suppliers, purchases, stock movement
- [x] POS-ready student shop
- [x] Daily/monthly/yearly financial reports
- [x] PDF/Excel export (UI ready)
- [ ] QR/Barcode support
- [ ] SMS/Email sending (UI ready, backend needed)
- [ ] Multi-language (3 languages — CR-2)
- [ ] Custom domains (future)
- [ ] Subscription enforcement (CR-7)
- [ ] Recurring donations (CR-5)
- [ ] Simplified accounting (CR-8)

---

# Database Expectations
Core entities: ✅ All 49 models implemented in Prisma schema.

Every business table includes `tenant_id`.  
New fields needed for CR-2, CR-4, CR-5, CR-7, CR-8, CR-11 — see `Database_Design_Specification_Madrasha_ERP.md`.

---

# UI Expectations
- [x] Responsive (mobile-first)
- [x] Dashboard KPIs (4 stat cards + 4 charts)
- [x] Clean sidebar (with nav groups)
- [x] Search everywhere (command palette Ctrl+K)
- [x] Filters (on all data tables)
- [x] Bulk actions (UI ready on data tables)
- [x] Print-friendly (financial reports, payslips, receipts)
- [x] Consistent design system (Islamic Modern Premium)
- [x] Reusable components (156 components)
- [x] English/Bengali font support loaded
- [ ] Full 3-language UI strings (CR-2)
- [ ] RTL layout for Arabic (CR-2)
- [ ] Sidebar accordion (CR-9)
- [ ] Subscription banners (CR-7)
- [ ] Simple accounting UI (CR-8)

---

# Developer Expectations
- [x] Modular code (7 domains)
- [x] Service layer (API routes scaffolded)
- [x] Validation (react-hook-form + zod on all forms)
- [x] REST API ready (54 routes)
- [ ] Queue ready (cron jobs needed for CR-5, CR-7)
- [ ] Unit-test friendly (no tests yet)
- [x] Secure authentication (NextAuth v4)
- [x] Soft deletes where appropriate (deleted_at on transactional tables)
- [x] Migration-first database design (Prisma)

---

# Recommended Build Order (Next Phase)
1. **CR-7** — SaaS Subscription Enforcement (core business model)
2. **CR-9** — Sidebar Collapsible Submenus (quick UX win)
3. **CR-1** — Bismillah Placement (quick fix)
4. **CR-6** — Sale Modal Fix (bug fix)
5. **CR-2** — Multi-Language System (large scope)
6. **CR-8** — Simplified Accounting (core usability)
7. **CR-4** — Sale-to-Student Fee Integration
8. **CR-5** — Recurring Donations
9. **CR-10** — Fee Category Form
10. **CR-11** — Image Upload Limits

---

# Handover Notes
- All UI is built with **sample data** — no real backend logic yet (APIs are scaffolded, not wired)
- The Prisma schema is complete with 49 models — needs new fields for CRs
- Frontend Developer needs the CORRECTION-WORK.md + department tracking files for implementation
- Priority is CR-7 (subscription enforcement) as it's the core business model
