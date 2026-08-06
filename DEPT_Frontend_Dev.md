# 💻 Frontend Developer — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Frontend Development
> **Last Updated**: August 2025
> **Note**: This department handles the final implementation after Architecture, Database, and Backend work is complete.

---

## ✅ COMPLETED (UI/UX Phase 0-12)

| ID | Task | Phase | Details |
|----|------|-------|---------|
| F-01 | Design system components | Phase 0 | 5 Islamic + 5 atoms + animations + tokens |
| F-02 | Layout & navigation | Phase 1 | Sidebar, header, mobile nav, command palette, 29 page shells |
| F-03 | Auth pages | Phase 2 | Login, register (3-step), forgot password |
| F-04 | Dashboard page | Phase 3 | Stats, charts, recent activity, quick actions |
| F-05 | Academic pages | Phase 4 | Students, teachers, employees, classes, sessions, promotions |
| F-06 | Finance pages | Phase 5 | Fees, collections, donations, expenses |
| F-07 | Payroll page | Phase 6 | Salary structures, payroll processor, payslip |
| F-08 | Inventory pages | Phase 7 | Products, purchases, stock, sales |
| F-09 | Accounting pages | Phase 8 | Chart of accounts, journal entries, reports |
| F-10 | CMS pages | Phase 9 | Website pages, notices, gallery |
| F-11 | System pages | Phase 10 | Users, roles, notifications, activity logs, settings |
| F-12 | Polish & animations | Phase 11 | AnimatedCounter, RippleButton, PageTransition, focus effects |
| F-13 | Accessibility | Phase 12 | Skip-to-content, ErrorBoundary, ARIA, print styles |

---

## ⏳ PENDING (From Correction Work — Requires Prior Departments First)

| ID | Task | Priority | CR# | Blocked By | Details |
|----|------|----------|-----|------------|---------|
| F-14 | Remove Bismillah from all PageHeaders | High | CR-1 | None | Remove `showBismillah` from ~30 PageHeader instances. Add BismillahHeader to AppHeader (centered, subtle, hidden on mobile). Keep on print layouts. |
| F-15 | Install & configure next-intl | High | CR-2 | A-13, B-13, BL-13 | Install next-intl, create /messages/en.json, bn.json, ar.json, wrap in NextIntlClientProvider |
| F-16 | Create translation files (~800 strings) | High | CR-2 | F-15 | Extract all hardcoded UI strings to translation keys |
| F-17 | Build LanguageSwitcher component | High | CR-2 | F-15 | Globe icon + dropdown in AppHeader. Language pref in Settings. |
| F-18 | Implement RTL support | High | CR-2 | F-15 | Tailwind rtl: variants, sidebar position swap, text direction, table direction for Arabic |
| F-19 | Dynamic content localization | High | CR-2 | F-15, B-13 | Show _bn/_ar fields based on active language for user-entered data |
| F-20 | Add "Sell to Student" in Sales form | High | CR-4 | B-14, BL-14 | Student search/selector, "Add to Monthly Fee" payment option, show in Fee Collections |
| F-21 | Recurring donation UI | Medium | CR-5 | B-15, BL-15 | Toggle in DonationForm (One-time/Monthly/Yearly), next due date, upcoming widget, reminder indicator |
| F-22 | Fix New Sale modal layout | **Critical** | CR-6 | None | Redesign SalesForm: card-based line items, vertical stacking on mobile, Drawer on mobile, +/- stepper |
| F-23 | Subscription status banner component | **Critical** | CR-7 | A-16, B-16, BL-06 | Amber/Red/Dark-red banners, read-only mode (disable all C/U/D buttons), login gate, payment page, plan cards |
| F-24 | bKash/Nagad payment UI | **Critical** | CR-7 | BL-10, BL-11 | Payment method selection, redirect flow, return handling |
| F-25 | Simple mode accounting screens | High | CR-8 | A-17, B-17, BL-17 | "Record Income/Expense" forms, "Money In vs Out" dashboard, mode toggle, conditional routing |
| F-26 | Sidebar accordion refactor | High | CR-9 | None | Collapsible groups, accordion behavior, active group auto-expand, Framer Motion height transitions |
| F-27 | Fee category CRUD form | Medium | CR-10 | BL-18 | FeeCategoryForm component (react-hook-form + zod), wire to API, replace placeholder |
| F-28 | Gallery upload limit UI | Medium | CR-11 | B-18, BL-19 | Usage bar, limit messages, upgrade prompt, compression indicator |

---

## 📊 Progress Summary
- **Completed**: 13 tasks (156 components, >29 pages, 40,563 lines)
- **Pending**: 15 tasks
- **Critical Priority**: 3 (CR-6 Sale fix, CR-7 Subscription UI + Payment UI)
- **High Priority**: 8 (CR-1 Bismillah, CR-2 i18n×5, CR-4 Sale-to-student, CR-8 Simple accounting, CR-9 Sidebar)
- **Medium Priority**: 3 (CR-5 Recurring, CR-10 Fee category, CR-11 Upload limits)
- **⚠️ BLOCKED**: Most tasks require prior Architecture/DB/Backend work to be complete first
