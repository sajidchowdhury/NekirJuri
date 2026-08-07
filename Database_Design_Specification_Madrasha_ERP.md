# Database Design Specification
## Madrasha ERP & Accounting Management System (SaaS)
### Version: 2.1 — Audited & Status-Corrected

> **Purpose**: Translate master specification into database architecture requirements  
> **Last Updated**: March 2026 (Audit — cross-referenced with actual codebase)  
> **Current State**: 50 Prisma models implemented, 7 domains, dual environment (SQLite dev / PostgreSQL prod)

---

## Database Platform
- **Development**: SQLite (via Prisma, file:./db/madrasha.db)
- **Production**: PostgreSQL (configured via .env.production)
- **ORM**: Prisma Client
- **Switch Commands**: `bun run db:dev` / `bun run db:prod`

### Why PostgreSQL for Production
- Better integrity and constraints
- Excellent support for SaaS multi-tenancy
- Strong indexing and reporting performance
- JSONB support for configurable modules
- Mature transactional engine

---

## Current Schema Status

### ✅ IMPLEMENTED — 50 Models Across 7 Domains

#### Domain 1: SaaS (3 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| Tenant | ✅ Done | id, uuid, name, slug, domain, logoUrl, address, city, state, country, phone, email, isActive, settings (Json), subscriptionStatus, isReadOnly, accountingMode, storageUsedMb |
| SubscriptionPlan | ✅ Done | id, name, price, duration, features (Json), isRecommended, maxAlbums, maxImagesPerAlbum, maxImageSizeMb |
| Subscription | ✅ Done | id, tenantId, planId, startDate, endDate, status (all CR-7 states), currentPeriodEnd, gracePeriodEnd, restrictedEnd, trialEnd, isAutoRenew, lastPaymentDate, lastPaymentMethod, lastPaymentRef, dataDeletionDate |

#### Domain 2: Security (5 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| User | ✅ Done | id, uuid, email, password, name, phone, photoUrl, isActive, lastLogin, language, emailVerified ⚠️ Missing: @@unique(email) |
| Role | ✅ Done | id, tenantId, name, isSystem, description |
| Permission | ✅ Done | id, name, module, description |
| RolePermission | ✅ Done | id, roleId, permissionId |
| UserRole | ✅ Done | id, userId, roleId, tenantId |

#### Domain 3: Academic (8 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| AcademicSession | ✅ Done | id, tenantId, name, startDate, endDate, isCurrent, status |
| Class | ✅ Done | id, tenantId, sessionId, name, code, capacity, teacherId, nameBn?, nameAr? |
| Section | ✅ Done | id, tenantId, classId, name, capacity, inChargeId |
| Student | ✅ Done | id, tenantId, name, nameBn, roll, gender, dob, phone, photoUrl, classId, sectionId, status |
| Guardian | ✅ Done | id, tenantId, name, nameBn, phone, email, occupation, relation |
| StudentGuardian | ✅ Done | id, studentId, guardianId, isPrimary |
| Teacher | ✅ Done | id, tenantId, name, nameBn, phone, email, qualification, photoUrl, status |
| Employee | ✅ Done | id, tenantId, name, nameBn, phone, email, department, designation, photoUrl, status |

#### Domain 4: Finance (11 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| FeeCategory | ✅ Done | id, tenantId, name, nameBn?, nameAr?, amount, frequency, isRecurring, isActive |
| FeeStructure | ✅ Done | id, tenantId, categoryId, classId, sessionId, amount |
| FeeInvoice | ✅ Done | id, tenantId, studentId, sessionId, totalAmount, paidAmount, balanceAmount, status, dueDate |
| FeeInvoiceItem | ✅ Done | id, invoiceId, categoryId, amount, discount, netAmount, salesInvoiceId? |
| FeeCollection | ✅ Done | id, tenantId, invoiceId, studentId, amount, paymentMethod, receiptNo, collectedBy |
| FeeDiscount | ✅ Done | id, tenantId, invoiceId, type, value, reason |
| DonationCategory | ✅ Done | id, tenantId, name, nameBn?, nameAr? |
| Donor | ✅ Done | id, tenantId, name, nameBn, phone, email, categoryId, totalPledged, reminderConsent, reminderMethod |
| Donation | ✅ Done | id, tenantId, donorId, categoryId, amount, date, paymentMethod, isRecurring, recurringFrequency, recurringAmount, nextDueDate, reminderSent, lastPaymentDate |
| ExpenseCategory | ✅ Done | id, tenantId, name, nameBn?, nameAr? |
| Expense | ✅ Done | id, tenantId, categoryId, amount, date, description, paymentMethod |

#### Domain 5: Inventory (8 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| Supplier | ✅ Done | id, tenantId, name, phone, email, address |
| ProductCategory | ✅ Done | id, tenantId, name, nameBn?, nameAr? |
| Product | ✅ Done | id, tenantId, categoryId, name, nameBn?, nameAr?, sku, purchasePrice, salePrice, stock, minStock, unit |
| Purchase | ✅ Done | id, tenantId, supplierId, totalAmount, status, date |
| PurchaseItem | ✅ Done | id, purchaseId, productId, quantity, unitPrice, total |
| StockMovement | ✅ Done | id, tenantId, productId, type, quantity, reference, reason |
| SalesInvoice | ✅ Done | id, tenantId, totalAmount, discount, grandTotal, paymentMethod, status, date, studentId?, addToFee, feeInvoiceId? |
| SalesItem | ✅ Done | id, salesInvoiceId, productId, quantity, unitPrice, total |

#### Domain 6: Accounting (2 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| ChartOfAccount | ✅ Done | id, tenantId, code, name, nameBn?, nameAr?, type, parentId, openingBalance, isActive |
| JournalEntry | ✅ Done | id, tenantId, date, description, status, entryNo + JournalEntryItem (debit, credit, accountId) |

#### Domain 7: System (12 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| SalaryStructure | ✅ Done | id, tenantId, employeeType, employeeId, basicSalary, allowances (Json), deductions (Json) |
| SalaryPayment | ✅ Done | id, tenantId, structureId, month, year, grossSalary, totalDeductions, netSalary, status |
| SubscriptionPayment | ✅ Done | id, subscriptionId, amount, paymentMethod, paymentRef, billingPeriod, status, verifiedAt |
| WebsitePage | ✅ Done | id, tenantId, title, titleBn?, titleAr?, slug, content, contentBn?, contentAr?, status, seoMeta (Json) |
| Notice | ✅ Done | id, tenantId, title, titleBn?, titleAr?, content, contentBn?, contentAr?, priority, audience, isPinned, date |
| Gallery | ✅ Done | id, tenantId, name, description, coverImage, imageCount |
| GalleryImage | ✅ Done | id, galleryId, url, caption, fileSizeKb |
| Settings | ✅ Done | id, tenantId, key, value (Json) |
| Notification | ✅ Done | id, tenantId, userId, title, message, type, isRead |
| ActivityLog | ✅ Done | id, tenantId, userId, action, entity, entityId, description, ipAddress |
| AuditLog | ✅ Done | id, tenantId, userId, action, entity, entityId, oldValues (Json), newValues (Json) |

---

## Architectural Principles (Implemented)
- [x] Multi-tenant using `tenant_id` on every business table
- [x] Auto-increment Int primary keys
- [x] UUID (cuid) exposed publicly where needed
- [x] Soft delete (`deleted_at`) on transactional tables
- [x] `created_at`, `updated_at` on all tables
- [x] Audit logging for critical operations (ActivityLog + AuditLog)
- [x] All monetary fields: Decimal type (no floating-point errors)
- [x] Structured data: Json type (settings, features, metadata)
- [x] snake_case table names via `@@map`

---

## 🔴 REMAINING SCHEMA CHANGES

### CR-7: Subscription Enforcement — ✅ COMPLETE

All fields now implemented in the Prisma schema:
- Subscription: currentPeriodEnd, gracePeriodEnd, restrictedEnd, lastPaymentDate, lastPaymentMethod, lastPaymentRef, dataDeletionDate
- Tenant: subscriptionStatus, isReadOnly
- User: emailVerified
- Composite index: @@index([tenantId, status, currentPeriodEnd])

---

### ~~CR-8: Simplified Accounting — Missing Field~~ ✅ RESOLVED
| Model | Field Added | Status |
|-------|-------------|--------|
| **Tenant** | `accountingMode String @default("double-entry") @map("accounting_mode")` | ✅ Done |

**Note**: Previously stored in `Tenant.settings.accountingMode` JSON field. Now a dedicated, queryable, indexable column.

---

### Module 28: Backup & Restore — New Model Needed
| Model | Fields | Priority |
|-------|--------|----------|
| **BackupRecord** | id, tenantId, type (full/partial), status (pending/running/completed/failed), sizeMb, storagePath, startedAt, completedAt, createdBy, expiresAt | High |

---

## Index Strategy (Current + Needed)
### Existing Indexes
- `tenant_id` on all business tables
- `status` on transactional tables
- `created_at` on all tables
- Composite: `(tenant_id, status)`, `(tenant_id, created_at)`

### ⚠️ Indexes Still Needed
| Table | Index | Reason | Priority |
|-------|-------|--------|----------|
| `donations` | `(tenant_id, is_recurring, next_due_date)` | ✅ Implemented — recurring donation reminder queries |
| `subscriptions` | `(tenant_id, status, current_period_end)` | Medium — subscription enforcement checks |
| `subscription_payments` | `(subscription_id, status)` | Medium — payment verification |
| `sales_invoices` | `(tenant_id, student_id)` | ✅ Implemented — student sale lookups |
| `users` | `(email)` UNIQUE | Medium — single account enforcement |

---

## Constraints (Current + New)
### Existing
- Foreign keys on all relations
- Prevent cross-tenant references via composite unique: `(tenant_id, username)`, `(tenant_id, student_registration)`, `(tenant_id, invoice_number)`

### ⚠️ New Constraints Needed
- `User.email` — **GLOBAL UNIQUE** (one email = one account, across all tenants) — Medium
- `SubscriptionPayment.transactionRef` — Unique per payment method (prevent duplicate payments) — Low
- `Donation.nextDueDate` — Only set when `isRecurring = true` — Low

---

## Reporting Considerations
Design optimized for:
- [x] Daily cash report
- [x] Monthly income/expense
- [x] Donation summary
- [x] Outstanding fees
- [x] Stock valuation
- [x] Salary register
- [x] **Recurring donation due report** (CR-5) ✅
- [x] **Subscription status report** (CR-7) ⚠️ (partial — needs schema fields)
- [x] **Simple mode income/expense summary** (CR-8) ✅
- [x] **Student product purchase report** (CR-4) ✅
- [ ] **Backup history report** (Module 28)

---

## Naming Standards
- [x] snake_case table names via `@@map`
- [x] Singular model names
- [x] Foreign keys: `tableId` (camelCase in Prisma, mapped to snake_case in DB)
- [x] Junction tables: `StudentGuardian`, `RolePermission`, `UserRole`

---

## Deliverables
1. [x] Complete Prisma Schema (50 models, 1400+ lines)
2. [ ] Updated ER Diagram (with CR-2 through CR-11 changes) — Low priority
3. [x] Data Dictionary (embedded in schema comments)
4. [x] Table Definitions (Prisma models)
5. [x] Relationships (Prisma relations)
6. [x] Index Plan (in schema)
7. [x] Constraints (unique, composite)
8. [ ] Migration Scripts for CR changes — Medium priority
9. [ ] Seed Data Plan (with Bengali/Arabic sample content for CR-2) — Medium priority
10. [ ] Backup Strategy — High priority

---

## Migration Order for Remaining Changes
1. **CR-7** — Subscription enforcement missing fields (5 fields on Subscription, 2 on Tenant, 1 on User)
2. **CR-8** — Accounting mode dedicated column (1 field on Tenant)
3. **Module 28** — BackupRecord model + backup strategy
4. **Indexes** — User.email unique, subscription_payments composite
