# 🏗️ Software Architect — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Software Architecture
> **Last Updated**: August 2025
> **Audit Date**: March 2026 — Cross-referenced with codebase & worklog

---

## ✅ COMPLETED

| ID | Task | Phase | CR# | Details |
|----|------|-------|-----|---------|
| A-01 | Multi-tenant SaaS architecture | Phase 0 | — | tenant_id isolation, composite unique constraints, 7-domain modular design |
| A-1 | Design system architecture | Phase 0 | — | Islamic Modern Premium theme, Emerald+Gold color system, OKLCH, dark mode |
| A-2 | Navigation architecture | Phase 1 | — | 7 groups, 25+ items, sidebar+header+mobile nav, command palette |
| A-3 | Auth flow architecture | Phase 2 | — | NextAuth v4, multi-step register, tenant+user+role creation in transaction |
| A-4 | Dashboard data architecture | Phase 0-3 | — | React Query + API route, stat cards + 4 chart types |
| A-5 | CRUD architecture | Phase 4 | — | DataTable (TanStack Table), FormWizard, DetailPageLayout, shared molecules |
| A-6 | Finance module architecture | Phase 5 | — | Fee categories + structure matrix + invoices + collections + donations + expenses |
| A-7 | Payroll architecture | Phase 6 | — | Salary structure → Payroll processor → Payslip flow |
| A-8 | Inventory architecture | Phase 7 | — | Products → PO → Stock → Sales pipeline |
| A-9 | Double-entry accounting architecture | Phase 8 | — | Chart of accounts tree, journal entries, trial balance, income statement, balance sheet |
| A-10 | RBAC architecture | Phase 10 | — | 32 permissions across 6 modules, role-permission matrix |
| A-11 | Animation architecture | Phase 11 | — | Framer Motion variants, prefers-reduced-motion, CSS keyframes |
| A-12 | Accessibility architecture | Phase 12 | — | Skip-to-content, ErrorBoundary, ARIA, print stylesheet |
| A-13 | Multi-language i18n architecture | CR-2 | CR-2 | ✅ next-intl setup, RTL strategy for Arabic, ~800 translation keys, dynamic content with _bn/_ar fields |
| A-14 | Sale-to-Student fee integration design | CR-4 | CR-4 | ✅ Cross-module flow: Sale → FeeInvoiceItem → Fee Collections. API contract implemented |
| A-15 | Recurring donation system design | CR-5 | CR-5 | ✅ Scheduling model, reminder cron job (port 3031), notification template, dashboard widget |
| A-16 | SaaS subscription enforcement design | CR-7 | CR-7 | ⚠️ MOSTLY DONE — State machine (Active→Grace→Restricted→Suspended→Terminated) implemented via computeEnforcement(). API middleware spec done. See A-21 for remaining schema gaps. |
| A-17 | Simplified accounting mode design | CR-8 | CR-8 | ⚠️ MOSTLY DONE — Dual-mode architecture implemented. Simple→expert mapping works. Auto-journal entry rules done. See A-22 for schema gap. |
| A-18 | Storage limits policy design | CR-11 | CR-11 | ✅ Tier-based limit matrix, image optimization pipeline, storage tracking — all implemented |

---

## ⏳ PENDING (Schema / Architecture Gaps)

| ID | Task | Priority | CR# | Dependencies | Details |
|----|------|----------|-----|-------------|---------|
| A-19 | Subscription schema alignment | Medium | CR-7 | DB schema update | Add dedicated `currentPeriodEnd`, `gracePeriodEnd`, `restrictedEnd` to Subscription model; `subscriptionStatus`, `isReadOnly` to Tenant model. Currently using `status`+`endDate` workaround. |
| A-20 | Accounting mode schema alignment | Low | CR-8 | DB schema update | Add dedicated `accountingMode` column to Tenant model. Currently stored in `Tenant.settings` JSON field — functionally equivalent but less queryable. |
| A-21 | Backup & Restore architecture | High | Module 28 | None | Design backup strategy (full/partial), restore flow, scheduled backup cron, storage management, disaster recovery plan |
| A-22 | Unit test architecture | Medium | — | None | Test framework selection (vitest/jest), test structure per domain, mock strategy for Prisma + API routes |
| A-23 | SMS/Email backend architecture | Medium | — | None | Provider integration design (Twilio/MSG91 for SMS, Resend/SendGrid for email), template system, queue management |

---

## 📊 Progress Summary
- **Completed**: 18 tasks (12 original + 6 CR architectures)
- **Pending**: 5 tasks
- **High Priority**: 1 (Backup & Restore architecture — Module 28)
- **Medium Priority**: 3 (CR-7 schema fix, Unit tests, SMS/Email)
- **Low Priority**: 1 (CR-8 schema alignment — cosmetic)
- **⚠️ Note**: CR-7 and CR-8 are functionally complete. Pending items are schema alignment improvements, not blocking.
