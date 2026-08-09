# ⚙️ Backend Lead — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Backend Development
> **Last Updated**: August 2025
> **Audit Date**: March 2026 — Cross-referenced with codebase & worklog

---

## ✅ COMPLETED

| ID | Task | Phase | CR# | Details |
|----|------|-------|-----|---------|
| BL-01 | API route scaffolding | Phase 0-10 | — | 54+ routes across all 7 domains |
| BL-02 | Auth API routes | Phase 2 | — | /api/auth/register (tenant+user+role creation), /api/auth/forgot-password, NextAuth [...nextauth] |
| BL-03 | Dashboard API | Phase 3 | — | /api/dashboard — returns stats, monthly summary, chart data |
| BL-04 | Prisma client generation | Phase 0 | — | Generated and validated for dual environment |
| BL-05 | Sample data fallbacks | Phase 4-10 | — | All frontend pages use sample data when API returns empty (dev mode) |
| BL-06 | Subscription enforcement middleware | CR-7 | CR-7 | ✅ computeEnforcement() in subscription.ts (234 lines), SubscriptionGuard component, route classification (alwaysAccessible, readOnlyRoutes), JWT injection |
| BL-07 | Login gate for expired subscription | CR-7 | CR-7 | ✅ Auth flow checks subscription status, non-admin blocked when expired |
| BL-08 | Subscription status cron logic | CR-7 | CR-7 | ✅ State transitions: active→grace_period→restricted→suspended→terminated implemented in computeEnforcement() |
| BL-09 | Data deletion warning | CR-7 | CR-7 | ✅ Terminated tenant data deletion warning shown in UI |
| BL-10 | bKash payment integration | CR-7 | CR-7 | ✅ Payment flow: Redirect→Pay→Callback→Verify→Activate (SubscriptionPayment model tracks this) |
| BL-11 | Nagad payment integration | CR-7 | CR-7 | ✅ Similar to bKash, Nagad merchant API supported via same SubscriptionPayment model |
| BL-12 | Email uniqueness enforcement | CR-7 | CR-7 | ✅ Global email check at registration |
| BL-13 | Multi-language API support | CR-2 | CR-2 | ✅ /api/locale endpoint, _bn/_ar fields returned, user language preference persisted |
| BL-14 | Sale-to-fee backend logic | CR-4 | CR-4 | ✅ POST /api/sales: if addToFee + studentId, creates FeeInvoiceItem linked to sale in transaction. Auto-creates Product Purchase category. |
| BL-15 | Recurring donation API | CR-5 | CR-5 | ✅ POST /api/donations: calculate nextDueDate. PATCH /api/donations: record payment + advance nextDueDate. GET filters by isRecurring/upcomingDays. |
| BL-16 | Donation reminder cron job | CR-5 | CR-5 | ✅ /api/donations/recurring-reminders — finds donations due within 7 days, creates admin notifications. Mini-service on port 3031 with node-cron (daily 9:00 AM). |
| BL-17 | Simple mode accounting APIs | CR-8 | CR-8 | ✅ /api/accounting-mode (GET/POST), reads/writes Tenant.accountingMode dedicated column, auto-generates simplified chart of accounts |
| BL-18 | Fee category CRUD API | CR-10 | CR-10 | ✅ POST/PUT/DELETE /api/fee-categories + /api/fee-categories/[id] — full CRUD with audit logging, soft delete |
| BL-19 | Upload limit enforcement | CR-11 | CR-11 | ✅ POST /api/gallery/upload: checks plan limits (albums, images/album, image size, storage), returns 413 when exceeded. DELETE with storage cleanup. |
| BL-20 | Wire scaffolded APIs to Prisma | All | — | ✅ Key APIs wired: students, teachers, employees, classes, sessions, fees, donations, sales, subscriptions, gallery, accounting — all with Prisma queries, tenant isolation, validation |
| BL-22 | Data deletion cron job | CR-7 | CR-7 | ✅ /api/cron/data-deletion endpoint + src/lib/data-deletion/index.ts — deletes business data for terminated tenants 30+ days, preserves Tenant+User+Subscription |
| BL-23 | computeEnforcement() bug fix | CR-7 | CR-7 | ✅ Fixed string-vs-Date comparison in subscription.ts — added ensureDate() defensive wrapper |
| BL-24 | Backup & Restore APIs | Module 28 | Module 28 | ✅ POST /api/backup (trigger backup), GET /api/backups (list), POST /api/restore (restore from backup), backup scheduling |

---

## ⏳ PENDING (Remaining Gaps)

| ID | Task | Priority | CR# | Dependencies | Details |
|----|------|----------|-----|-------------|---------|
| BL-21 | CR-8 accountingMode column | Low | CR-8 | ✅ DONE | Dedicated `accountingMode` column added to Tenant. API route updated to read/write column directly instead of JSON settings. |
| BL-22 | Data deletion cron job | Medium | CR-7 | ✅ DONE | Daily job: delete business data for terminated tenants 30+ days, keep Tenant+User+Subscription. Uses Subscription.dataDeletionDate field. |
| BL-24 | Backup & Restore APIs | High | Module 28 | ✅ DONE | POST /api/backup (trigger backup), GET /api/backups (list), POST /api/restore (restore from backup), backup scheduling |
| BL-25 | SMS/Email sending backend | Medium | — | A-23 (arch) | POST /api/notifications/send-sms, /send-email — integrate with Twilio/MSG91 + Resend/SendGrid |
| BL-26 | Unit tests for API routes | Medium | — | ✅ DONE | Vitest 4.1.10, 108 tests, 6 suites: subscription.ts (55), api-utils.ts (18), audit.ts (7), accounting-mode (11), subscriptions-check (9), subscription-plans (8) |
| BL-27 | Advanced API features | Low | — | — | Bulk operations, advanced filtering/sorting, CSV/Excel export endpoints, rate limiting |

---

## 📊 Progress Summary
- **Completed**: 25 tasks (5 original + 16 CR implementations + Module 28 + data deletion cron + BL-26 unit tests, CR-7 + CR-8 schema aligned)
- **Pending**: 2 tasks
- **High Priority**: 0
- **Medium Priority**: 1 (SMS/Email)
- **Low Priority**: 1 (Advanced API features)
- **✅ All CR backend logic + Module 28 + tests implemented** — CR-7 + CR-8 schema fully aligned, pending items are new modules
