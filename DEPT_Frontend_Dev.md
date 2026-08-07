# 💻 Frontend Developer — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Frontend Development
> **Last Updated**: August 2025
> **Audit Date**: March 2026 — Cross-referenced with codebase & worklog

---

## ✅ COMPLETED (UI/UX Phase 0-12 + All CRs)

| ID | Task | Phase | CR# | Details |
|----|------|-------|-----|---------|
| F-01 | Design system components | Phase 0 | — | 5 Islamic + 5 atoms + animations + tokens |
| F-02 | Layout & navigation | Phase 1 | — | Sidebar, header, mobile nav, command palette, 29 page shells |
| F-03 | Auth pages | Phase 2 | — | Login, register (3-step), forgot password |
| F-04 | Dashboard page | Phase 3 | — | Stats, charts, recent activity, quick actions |
| F-05 | Academic pages | Phase 4 | — | Students, teachers, employees, classes, sessions, promotions |
| F-06 | Finance pages | Phase 5 | — | Fees, collections, donations, expenses |
| F-07 | Payroll page | Phase 6 | — | Salary structures, payroll processor, payslip |
| F-08 | Inventory pages | Phase 7 | — | Products, purchases, stock, sales |
| F-09 | Accounting pages | Phase 8 | — | Chart of accounts, journal entries, reports |
| F-10 | CMS pages | Phase 9 | — | Website pages, notices, gallery |
| F-11 | System pages | Phase 10 | — | Users, roles, notifications, activity logs, settings |
| F-12 | Polish & animations | Phase 11 | — | AnimatedCounter, RippleButton, PageTransition, focus effects |
| F-13 | Accessibility | Phase 12 | — | Skip-to-content, ErrorBoundary, ARIA, print styles |
| F-14 | Remove Bismillah from PageHeaders | CR-1 | CR-1 | ✅ Removed from all ~30 PageHeaders. Added to AppHeader (centered, subtle, hidden on mobile). Kept on print layouts. |
| F-15 | Install & configure next-intl | CR-2 | CR-2 | ✅ next-intl setup, /messages/en.json, bn.json, ar.json, NextIntlClientProvider |
| F-16 | Create translation files (~800 strings) | CR-2 | CR-2 | ✅ 292-line translation files per language (en, bn, ar) — ~150 keys per language |
| F-17 | Build LanguageSwitcher component | CR-2 | CR-2 | ✅ Globe icon + dropdown in AppHeader, cookie persistence, instant DOM dir/font update |
| F-18 | Implement RTL support | CR-2 | CR-2 | ✅ rtlLocales: ['ar'], Tailwind rtl: variants, sidebar position swap, text direction for Arabic |
| F-19 | Dynamic content localization | CR-2 | CR-2 | ✅ _bn/_ar fields shown based on active language for user-entered data |
| F-20 | Add "Sell to Student" in Sales form | CR-4 | CR-4 | ✅ Student search/selector, "Add to Monthly Fee" toggle, info banner, fee invoice link |
| F-21 | Recurring donation UI | CR-5 | CR-5 | ✅ Toggle in DonationForm (One-time/Monthly/Yearly), nextDueDate, DonationsDataTable with recurring status + overdue indicators, RecurringPaymentDialog, DashboardRecurringDonations widget, DonorList with reminder preferences |
| F-22 | Fix New Sale modal layout | CR-6 | CR-6 | ✅ Card-based line items, vertical stacking on mobile, Drawer on mobile, +/- stepper, stock warnings |
| F-23 | Subscription status banner | CR-7 | CR-7 | ✅ SubscriptionBanner by enforcement level (amber/red/dark-red), SubscriptionGuard with read-only mode + upgrade CTA, login gate |
| F-24 | bKash/Nagad payment UI | CR-7 | CR-7 | ✅ Payment method selection, billing page with plan cards |
| F-25 | Simple mode accounting screens | CR-8 | CR-8 | ✅ SimplifiedChartOfAccounts, SimplifiedJournalEntryForm, SimplifiedAccountingSummary dashboard, mode toggle in Settings, mode-aware pages (Chart of Accounts, Journal Entries) |
| F-26 | Sidebar accordion refactor | CR-9 | CR-9 | ✅ useAccordionGroups() hook, Collapsible groups, active group auto-expand, Framer Motion transitions |
| F-27 | Fee category CRUD form | CR-10 | CR-10 | ✅ FeeCategoryForm (react-hook-form + zod), edit/delete dialogs, audit logging, Bengali name field |
| F-28 | Gallery upload limit UI | CR-11 | CR-11 | ✅ GalleryLimitsBar with progress bars + upgrade prompt, image/album limits, 413 handling, real file upload with size validation |

---

## ⏳ PENDING (New Modules & Improvements)

| ID | Task | Priority | Module | Details |
|----|------|----------|--------|---------|
| F-29 | Backup & Restore UI | High | Module 28 | Backup list page, trigger backup button, restore dialog, backup schedule settings, storage usage display |
| F-30 | QR/Barcode UI | Medium | Future | QR code generation for students/receipts, barcode for inventory products, scanner component |
| F-31 | SMS/Email template UI | Medium | Future | Template editor, preview, send test, notification log |
| F-32 | Unit test setup | Medium | — | Vitest/Jest config, component test examples, API route test examples |
| F-33 | Mobile PWA improvements | Low | — | Service worker, offline mode, push notifications, install prompt |

---

## 📊 Progress Summary
- **Completed**: 28 tasks (13 original phases + 15 CR implementations)
- **Pending**: 5 tasks
- **High Priority**: 1 (Backup & Restore UI — Module 28)
- **Medium Priority**: 3 (QR/Barcode, SMS/Email templates, Unit tests)
- **Low Priority**: 1 (PWA improvements)
- **✅ ALL CR frontend work is COMPLETE** — no CRs remain for frontend
