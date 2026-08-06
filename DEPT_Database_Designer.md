# 🗄️ Database Designer — Task Tracker
## Madrasha ERP & Accounting Management System (SaaS)

> **Department**: Database Design
> **Last Updated**: August 2025

---

## ✅ COMPLETED

| ID | Task | Phase | Details |
|----|------|-------|---------|
| B-01 | Dual environment setup | Phase 0 | SQLite (dev) + PostgreSQL (prod), Prisma ORM, switch commands |
| B-02 | SaaS domain models | Phase 0 | Tenant, SubscriptionPlan, Subscription (3 models) |
| B-03 | Security domain models | Phase 0 | User, Role, Permission, RolePermission, UserRole (5 models) |
| B-04 | Academic domain models | Phase 1 | AcademicSession, Class, Section, Student, Guardian, StudentGuardian, Teacher, Employee (8 models) |
| B-05 | Finance domain models | Phase 2-5 | FeeCategory, FeeStructure, FeeInvoice, FeeInvoiceItem, FeeCollection, FeeDiscount, DonationCategory, Donor, Donation, ExpenseCategory, Expense (11 models) |
| B-06 | Payroll domain models | Phase 6 | SalaryStructure, SalaryPayment (2 models) |
| B-07 | Inventory domain models | Phase 7 | Supplier, ProductCategory, Product, Purchase, PurchaseItem, StockMovement, SalesInvoice, SalesItem (8 models) |
| B-08 | Accounting domain models | Phase 8 | ChartOfAccount, JournalEntry, JournalEntryItem (3 models) |
| B-09 | System domain models | Phase 9-10 | WebsitePage, Notice, Gallery, GalleryImage, Settings, Notification, ActivityLog, AuditLog (8 models) |
| B-10 | Decimal conversion | Phase 0 | All 46 Float→Decimal for financial precision |
| B-11 | Json type conversion | Phase 0 | Settings, features, metadata, audit values → Json type |
| B-12 | Index strategy | Phase 0 | tenant_id, status, created_at, composite indexes |

---

## ⏳ PENDING (From Correction Work)

| ID | Task | Priority | CR# | New Fields/Models | Details |
|----|------|----------|-----|-------------------|---------|
| B-13 | Multi-language schema fields | High | CR-2 | ~25 new fields across 12 models | User.language, Tenant.defaultLanguage, _bn/_ar fields on FeeCategory, DonationCategory, ExpenseCategory, ProductCategory, Product, Class, ChartOfAccount, Notice, WebsitePage, SubscriptionPlan |
| B-14 | Sale-to-fee schema changes | High | CR-4 | 3 new fields, 2 new relations | SalesInvoice: studentId, addToFee, feeInvoiceId. FeeInvoiceItem: salesInvoiceId |
| B-15 | Recurring donation schema | Medium | CR-5 | 8 new fields across 2 models | Donation: isRecurring, recurringFrequency, recurringAmount, nextDueDate, reminderSent, lastPaymentDate. Donor: totalPledged, reminderConsent, reminderMethod |
| B-16 | Subscription enforcement schema | **Critical** | CR-7 | 8 new fields + 1 new model | Subscription: currentPeriodEnd, gracePeriodEnd, restrictedEnd, lastPaymentDate, lastPaymentMethod, lastPaymentRef, dataDeletionDate. User: emailVerified. Tenant: subscriptionStatus, isReadOnly, storageUsedMb. NEW: SubscriptionPayment Model |
| B-17 | Simplified accounting schema | High | CR-8 | 1 new field | Tenant: accountingMode ("simple"/"expert") |
| B-18 | Storage limits schema | Medium | CR-11 | 5 new fields | SubscriptionPlan: maxAlbums, maxImagesPerAlbum, maxImageSizeMb, maxStorageMb. Gallery: imageCount |
| B-19 | New indexes | Medium | CR-5,7 | 5 new indexes | donations(tenant_id, is_recurring, next_due_date), subscriptions(tenant_id, status, current_period_end), subscription_payments(subscription_id, status), sales_invoices(tenant_id, student_id), users(email) UNIQUE |
| B-20 | Migration scripts | High | All CRs | N/A | Generate Prisma migrations for all schema changes |

---

## 📊 Progress Summary
- **Completed**: 12 tasks (49 models, 1314 lines of schema)
- **Pending**: 8 tasks
- **New fields estimated**: ~50 fields across 15+ models
- **New models estimated**: 1 (SubscriptionPayment)
- **Critical Priority**: 1 (CR-7 Subscription schema)
