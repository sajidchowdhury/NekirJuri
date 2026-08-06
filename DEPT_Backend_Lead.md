# ⚙️ Backend Lead — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Backend Development
> **Last Updated**: August 2025

---

## ✅ COMPLETED

| ID | Task | Phase | Details |
|----|------|-------|---------|
| BL-01 | API route scaffolding | Phase 0-10 | 54 routes across all 7 domains (CRUD scaffold, not wired to real logic) |
| BL-02 | Auth API routes | Phase 2 | /api/auth/register (tenant+user+role creation), /api/auth/forgot-password, NextAuth [...nextauth] |
| BL-03 | Dashboard API | Phase 3 | /api/dashboard — returns stats, monthly summary, chart data |
| BL-04 | Prisma client generation | Phase 0 | Generated and validated for dual environment |
| BL-05 | Sample data fallbacks | Phase 4-10 | All frontend pages use sample data when API returns empty (dev mode) |

---

## ⏳ PENDING (From Correction Work)

| ID | Task | Priority | CR# | Dependencies | Details |
|----|------|----------|-----|-------------|---------|
| BL-06 | Subscription enforcement middleware | **Critical** | CR-7 | B-16 (schema) | API guard on EVERY route: check tenant.isReadOnly, block non-GET for non-admin when restricted |
| BL-07 | Login gate for expired subscription | **Critical** | CR-7 | BL-06 | Auth flow: check subscription status, block non-admin login when expired |
| BL-08 | Subscription status cron job | **Critical** | CR-7 | BL-06 | Daily job: active→grace→restricted→suspended→terminated, update tenant.isReadOnly |
| BL-09 | Data deletion cron job | **Critical** | CR-7 | BL-08 | Daily job: delete business data for terminated tenants 30+ days, keep Tenant+User+Subscription |
| BL-10 | bKash payment integration | **Critical** | CR-7 | BL-06 | Redirect→Pay→Callback→Verify→Activate subscription flow |
| BL-11 | Nagad payment integration | **Critical** | CR-7 | BL-06 | Similar to bKash, Nagad merchant API |
| BL-12 | Email uniqueness enforcement | **Critical** | CR-7 | B-16 | Registration: global email check, email verification with OTP |
| BL-13 | Multi-language API support | High | CR-2 | B-13 (schema) | Return localized content (_bn/_ar fields), user language preference endpoint |
| BL-14 | Sale-to-fee backend logic | High | CR-4 | B-14 (schema) | POST /api/sales: if addToFee + studentId, create FeeInvoiceItem linked to sale |
| BL-15 | Recurring donation API | Medium | CR-5 | B-15 (schema) | POST /api/donations: calculate nextDueDate. PATCH /api/donations/:id/pay: advance nextDueDate |
| BL-16 | Donation reminder cron job | Medium | CR-5 | BL-15 | Daily: find donations due within 7 days, create admin notifications, send email/SMS to donor |
| BL-17 | Simple mode accounting APIs | High | CR-8 | B-17 (schema) | POST /api/accounting/simple/income, /expense, /transfer — auto-create balanced journal entries |
| BL-18 | Fee category CRUD API | Medium | CR-10 | None | POST/PUT/DELETE /api/fee-categories — currently scaffolded only |
| BL-19 | Upload limit enforcement | Medium | CR-11 | B-18 (schema), BL-06 | POST /api/gallery/upload: check plan limits before accepting, compress if needed, update storageUsedMb |
| BL-20 | Wire all scaffolded APIs to Prisma | High | All | B-20 (migrations) | Connect 54 API routes to actual Prisma queries with proper validation, tenant isolation, error handling |

---

## 📊 Progress Summary
- **Completed**: 5 tasks (scaffolded, not production-ready)
- **Pending**: 15 tasks
- **Critical Priority**: 7 tasks (CR-7 subscription enforcement — the CORE business model)
- **High Priority**: 4 tasks (CR-2 i18n, CR-4 sale-to-fee, CR-8 simple accounting, wire APIs)
- **Medium Priority**: 4 tasks (CR-5 recurring, CR-10 fee cat, CR-11 upload limits)
- **⚠️ WARNING**: All 54 API routes are scaffolded — NONE are production-ready. This is the biggest pending work item.
