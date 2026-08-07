# 🗄️ Database Designer — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Database Design
> **Last Updated**: August 2025
> **Audit Date**: March 2026 — Cross-referenced with codebase & worklog

---

## ✅ COMPLETED

| ID | Task | Phase | CR# | Details |
|----|------|-------|-----|---------|
| B-01 | Dual environment setup | Phase 0 | — | SQLite (dev) + PostgreSQL (prod), Prisma ORM, switch commands |
| B-02 | SaaS domain models | Phase 0 | — | Tenant, SubscriptionPlan, Subscription (3 models) |
| B-03 | Security domain models | Phase 0 | — | User, Role, Permission, RolePermission, UserRole (5 models) |
| B-04 | Academic domain models | Phase 1 | — | AcademicSession, Class, Section, Student, Guardian, StudentGuardian, Teacher, Employee (8 models) |
| B-05 | Finance domain models | Phase 2-5 | — | FeeCategory, FeeStructure, FeeInvoice, FeeInvoiceItem, FeeCollection, FeeDiscount, DonationCategory, Donor, Donation, ExpenseCategory, Expense (11 models) |
| B-06 | Payroll domain models | Phase 6 | — | SalaryStructure, SalaryPayment (2 models) |
| B-07 | Inventory domain models | Phase 7 | — | Supplier, ProductCategory, Product, Purchase, PurchaseItem, StockMovement, SalesInvoice, SalesItem (8 models) |
| B-08 | Accounting domain models | Phase 8 | — | ChartOfAccount, JournalEntry, JournalEntryItem (3 models) |
| B-09 | System domain models | Phase 9-10 | — | WebsitePage, Notice, Gallery, GalleryImage, Settings, Notification, ActivityLog, AuditLog (8 models) |
| B-10 | Decimal conversion | Phase 0 | — | All 46 Float→Decimal for financial precision |
| B-11 | Json type conversion | Phase 0 | — | Settings, features, metadata, audit values → Json type |
| B-12 | Index strategy | Phase 0 | — | tenant_id, status, created_at, composite indexes |
| B-13 | Multi-language schema fields | CR-2 | CR-2 | ✅ User.language, Tenant.defaultLanguage, _bn/_ar fields on FeeCategory, DonationCategory, ExpenseCategory, ProductCategory, Product, Class, ChartOfAccount, Notice, WebsitePage, SubscriptionPlan |
| B-14 | Sale-to-fee schema changes | CR-4 | CR-4 | ✅ SalesInvoice: studentId, addToFee, feeInvoiceId. FeeInvoiceItem: salesInvoiceId. All relations implemented. |
| B-15 | Recurring donation schema | CR-5 | CR-5 | ✅ Donation: isRecurring, recurringFrequency, recurringAmount, nextDueDate, reminderSent, lastPaymentDate. Donor: totalPledged, reminderConsent, reminderMethod. All in schema. |
| B-16 | Subscription enforcement schema | CR-7 | CR-7 | ✅ COMPLETE — SubscriptionPayment model ✅. Subscription: status (all states) ✅, currentPeriodEnd ✅, gracePeriodEnd ✅, restrictedEnd ✅, lastPaymentDate ✅, lastPaymentMethod ✅, lastPaymentRef ✅, dataDeletionDate ✅. Tenant: storageUsedMb ✅, subscriptionStatus ✅, isReadOnly ✅. User: emailVerified ✅. Composite index ✅. |
| B-17 | Simplified accounting schema | CR-8 | CR-8 | ✅ COMPLETE — Tenant.accountingMode dedicated column added (String @default("double-entry")). API route updated to use column directly. |
| B-18 | Storage limits schema | CR-11 | CR-11 | ✅ SubscriptionPlan: maxAlbums, maxImagesPerAlbum, maxImageSizeMb. Gallery: imageCount. GalleryImage: fileSizeKb. Tenant: storageUsedMb. All in schema. |
| B-19 | CR-related indexes | CR-5,7 | CR-5,7 | ✅ Key indexes added for donations (is_recurring, next_due_date), subscriptions (status), sales (student_id) |

---

## ⏳ PENDING (Schema Gaps & New Work)

| ID | Task | Priority | CR# | New Fields/Models | Details |
|----|------|----------|-----|-------------------|---------|
| B-20 | CR-8 dedicated column | Low | CR-8 | ✅ DONE | Tenant.accountingMode String @default("double-entry") @map("accounting_mode") added. API route updated. |
| B-21 | Email unique index | Medium | CR-7 | 1 index | User.email — GLOBAL UNIQUE constraint (one email = one account across tenants) |
| B-22 | Migration scripts | High | All | N/A | Generate formal Prisma migrations for all CR schema changes (currently using db:push) |
| B-23 | Seed data with i18n | Medium | CR-2 | N/A | Seed data plan with Bengali/Arabic sample content for all _bn/_ar fields |
| B-24 | Backup strategy | High | Module 28 | 1+ new model | BackupRecord model, backup scheduling, storage management, restore validation |
| B-25 | ER Diagram update | Low | — | N/A | Updated ER Diagram with all CR-2 through CR-11 changes |

---

## 📊 Progress Summary
- **Completed**: 20 tasks (12 original + 8 CR schema changes, CR-7 + CR-8 fully aligned)
- **Pending**: 5 tasks
- **High Priority**: 2 (Migration scripts, Backup strategy)
- **Medium Priority**: 2 (Email unique index, Seed data)
- **Low Priority**: 1 (ER Diagram)
- **Total models**: 50 (49 original + SubscriptionPayment)
- **Schema status**: All CR fields pushed and working. Gaps are optimization/alignment items.
