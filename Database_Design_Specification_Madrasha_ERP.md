# Database Design Specification
## Madrasha ERP & Accounting Management System (SaaS)
### Version: 2.0 — Post Phase 12 Update

> **Purpose**: Translate master specification into database architecture requirements  
> **Last Updated**: August 2025  
> **Current State**: 49 Prisma models implemented, 7 domains, dual environment (SQLite dev / PostgreSQL prod)

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

### ✅ IMPLEMENTED — 49 Models Across 7 Domains

#### Domain 1: SaaS (3 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| Tenant | ✅ Done | id, uuid, name, slug, domain, logoUrl, address, city, state, country, phone, email, isActive, settings (Json) |
| SubscriptionPlan | ✅ Done | id, name, price, duration, features (Json), isRecommended |
| Subscription | ✅ Done | id, tenantId, planId, startDate, endDate, status |

#### Domain 2: Security (5 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| User | ✅ Done | id, uuid, email, password, name, phone, photoUrl, isActive, lastLogin |
| Role | ✅ Done | id, tenantId, name, isSystem, description |
| Permission | ✅ Done | id, name, module, description |
| RolePermission | ✅ Done | id, roleId, permissionId |
| UserRole | ✅ Done | id, userId, roleId, tenantId |

#### Domain 3: Academic (8 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| AcademicSession | ✅ Done | id, tenantId, name, startDate, endDate, isCurrent, status |
| Class | ✅ Done | id, tenantId, sessionId, name, code, capacity, teacherId |
| Section | ✅ Done | id, tenantId, classId, name, capacity, inChargeId |
| Student | ✅ Done | id, tenantId, name, nameBn, roll, gender, dob, phone, photoUrl, classId, sectionId, status |
| Guardian | ✅ Done | id, tenantId, name, nameBn, phone, email, occupation, relation |
| StudentGuardian | ✅ Done | id, studentId, guardianId, isPrimary |
| Teacher | ✅ Done | id, tenantId, name, nameBn, phone, email, qualification, photoUrl, status |
| Employee | ✅ Done | id, tenantId, name, nameBn, phone, email, department, designation, photoUrl, status |

#### Domain 4: Finance (11 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| FeeCategory | ✅ Done | id, tenantId, name, amount, frequency |
| FeeStructure | ✅ Done | id, tenantId, categoryId, classId, sessionId, amount |
| FeeInvoice | ✅ Done | id, tenantId, studentId, sessionId, totalAmount, paidAmount, balanceAmount, status, dueDate |
| FeeInvoiceItem | ✅ Done | id, invoiceId, categoryId, amount, discount, netAmount |
| FeeCollection | ✅ Done | id, tenantId, invoiceId, studentId, amount, paymentMethod, receiptNo, collectedBy |
| FeeDiscount | ✅ Done | id, tenantId, invoiceId, type, value, reason |
| DonationCategory | ✅ Done | id, tenantId, name |
| Donor | ✅ Done | id, tenantId, name, nameBn, phone, email, categoryId |
| Donation | ✅ Done | id, tenantId, donorId, categoryId, amount, date, paymentMethod |
| ExpenseCategory | ✅ Done | id, tenantId, name |
| Expense | ✅ Done | id, tenantId, categoryId, amount, date, description, paymentMethod |

#### Domain 5: Inventory (8 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| Supplier | ✅ Done | id, tenantId, name, phone, email, address |
| ProductCategory | ✅ Done | id, tenantId, name |
| Product | ✅ Done | id, tenantId, categoryId, name, sku, purchasePrice, salePrice, stock, minStock, unit |
| Purchase | ✅ Done | id, tenantId, supplierId, totalAmount, status, date |
| PurchaseItem | ✅ Done | id, purchaseId, productId, quantity, unitPrice, total |
| StockMovement | ✅ Done | id, tenantId, productId, type, quantity, reference, reason |
| SalesInvoice | ✅ Done | id, tenantId, totalAmount, discount, grandTotal, paymentMethod, status, date |
| SalesItem | ✅ Done | id, salesInvoiceId, productId, quantity, unitPrice, total |

#### Domain 6: Accounting (2 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| ChartOfAccount | ✅ Done | id, tenantId, code, name, type, parentId, openingBalance, isActive |
| JournalEntry | ✅ Done | id, tenantId, date, description, status, entryNo + JournalEntryItem (debit, credit, accountId) |

#### Domain 7: System (12 models)
| Model | Status | Key Fields |
|-------|--------|------------|
| SalaryStructure | ✅ Done | id, tenantId, employeeType, employeeId, basicSalary, allowances (Json), deductions (Json) |
| SalaryPayment | ✅ Done | id, tenantId, structureId, month, year, grossSalary, totalDeductions, netSalary, status |
| WebsitePage | ✅ Done | id, tenantId, title, slug, content, status, seoMeta (Json) |
| Notice | ✅ Done | id, tenantId, title, content, priority, audience, isPinned, date |
| Gallery | ✅ Done | id, tenantId, name, description, coverImage |
| GalleryImage | ✅ Done | id, galleryId, url, caption |
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

## 🔴 NEW SCHEMA CHANGES REQUIRED

### CR-2: Multi-Language Fields
Add localized content fields to entities with user-facing names:

| Model | New Fields |
|-------|-----------|
| **User** | `language String @default("en")` |
| **Tenant** | `defaultLanguage String @default("en")` |
| **FeeCategory** | `nameBn String?`, `nameAr String?` |
| **DonationCategory** | `nameBn String?`, `nameAr String?` |
| **ExpenseCategory** | `nameBn String?`, `nameAr String?` |
| **ProductCategory** | `nameBn String?`, `nameAr String?` |
| **Product** | `nameBn String?`, `nameAr String?` |
| **Class** | `nameBn String?`, `nameAr String?` |
| **ChartOfAccount** | `nameBn String?`, `nameAr String?` |
| **Notice** | `titleBn String?`, `titleAr String?`, `contentBn String?`, `contentAr String?` |
| **WebsitePage** | `titleBn String?`, `titleAr String?`, `contentBn String?`, `contentAr String?` |
| **SubscriptionPlan** | `nameBn String?`, `nameAr String?` |

**Estimated**: ~25 new fields across 12 models

---

### CR-4: Sale-to-Student Fee Integration
| Model | New Fields |
|-------|-----------|
| **SalesInvoice** | `studentId Int?` (null = walk-in), `addToFee Boolean @default(false)`, `feeInvoiceId Int?` |
| **FeeInvoiceItem** | `salesInvoiceId Int?` (link back to sale) |

**New Relations**:
- `SalesInvoice → Student` (optional)
- `SalesInvoice → FeeInvoice` (optional, if addToFee)
- `FeeInvoiceItem → SalesInvoice` (optional)

---

### CR-5: Recurring Donations
| Model | New Fields |
|-------|-----------|
| **Donation** | `isRecurring Boolean @default(false)`, `recurringFrequency String?` ("monthly"/"yearly"), `recurringAmount Decimal? @db.Decimal(12,2)`, `nextDueDate DateTime?`, `reminderSent Boolean @default(false)`, `lastPaymentDate DateTime?` |
| **Donor** | `totalPledged Decimal @default(0) @db.Decimal(12,2)`, `reminderConsent Boolean @default(true)`, `reminderMethod String @default("email")` ("email"/"sms"/"both") |

---

### CR-7: Subscription Enforcement
| Model | New Fields |
|-------|-----------|
| **Subscription** | `currentPeriodEnd DateTime`, `gracePeriodEnd DateTime?`, `restrictedEnd DateTime?`, `lastPaymentDate DateTime?`, `lastPaymentMethod String?` ("bkash"/"nagad"), `lastPaymentRef String?`, `dataDeletionDate DateTime?` |
| **User** | `emailVerified Boolean @default(false)` |
| **Tenant** | `subscriptionStatus String @default("active")` (cached), `isReadOnly Boolean @default(false)`, `storageUsedMb Decimal @default(0) @db.Decimal(12,2)` |

**New Model**:
```prisma
model SubscriptionPayment {
  id              Int      @id @default(autoincrement())
  subscriptionId  Int
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  amount          Decimal  @db.Decimal(12,2)
  paymentMethod   String   // "bkash" | "nagad"
  transactionRef  String?
  periodStart     DateTime
  periodEnd       DateTime
  status          String   @default("pending") // "pending" | "verified" | "failed"
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  @@map("subscription_payments")
}
```

---

### CR-8: Simplified Accounting
| Model | New Fields |
|-------|-----------|
| **Tenant** | `accountingMode String @default("simple")` ("simple"/"expert") |

No other schema changes — existing double-entry tables remain. Simple mode auto-generates journal entries via backend logic.

---

### CR-11: Storage Limits
| Model | New Fields |
|-------|-----------|
| **SubscriptionPlan** | `maxAlbums Int @default(5)`, `maxImagesPerAlbum Int @default(20)`, `maxImageSizeMb Int @default(2)`, `maxStorageMb Int @default(200)` |
| **Gallery** | `imageCount Int @default(0)` (cached count for quick limit checks) |

---

## Index Strategy (Current + Needed)
### Existing Indexes
- `tenant_id` on all business tables
- `status` on transactional tables
- `created_at` on all tables
- Composite: `(tenant_id, status)`, `(tenant_id, created_at)`

### New Indexes Needed
| Table | Index | Reason |
|-------|-------|--------|
| `donations` | `(tenant_id, is_recurring, next_due_date)` | Recurring donation reminder queries |
| `subscriptions` | `(tenant_id, status, current_period_end)` | Subscription enforcement checks |
| `subscription_payments` | `(subscription_id, status)` | Payment verification |
| `sales_invoices` | `(tenant_id, student_id)` | Student sale lookups |
| `users` | `(email)` UNIQUE | Single account enforcement |

---

## Constraints (Current + New)
### Existing
- Foreign keys on all relations
- Prevent cross-tenant references via composite unique: `(tenant_id, username)`, `(tenant_id, student_registration)`, `(tenant_id, invoice_number)`

### New Constraints
- `User.email` — **GLOBAL UNIQUE** (one email = one account, across all tenants)
- `SubscriptionPayment.transactionRef` — Unique per payment method (prevent duplicate payments)
- `Donation.nextDueDate` — Only set when `isRecurring = true`

---

## Reporting Considerations
Design optimized for:
- [x] Daily cash report
- [x] Monthly income/expense
- [x] Donation summary
- [x] Outstanding fees
- [x] Stock valuation
- [x] Salary register
- [ ] **Recurring donation due report** (CR-5)
- [ ] **Subscription status report** (CR-7)
- [ ] **Simple mode income/expense summary** (CR-8)
- [ ] **Student product purchase report** (CR-4)

---

## Naming Standards
- [x] snake_case table names via `@@map`
- [x] Singular model names
- [x] Foreign keys: `tableId` (camelCase in Prisma, mapped to snake_case in DB)
- [x] Junction tables: `StudentGuardian`, `RolePermission`, `UserRole`

---

## Deliverables
1. [x] Complete Prisma Schema (49 models, 1314 lines)
2. [ ] Updated ER Diagram (with CR-2 through CR-11 changes)
3. [x] Data Dictionary (embedded in schema comments)
4. [x] Table Definitions (Prisma models)
5. [x] Relationships (Prisma relations)
6. [x] Index Plan (in schema)
7. [x] Constraints (unique, composite)
8. [ ] Migration Scripts for CR changes
9. [ ] Seed Data Plan (with Bengali/Arabic sample content for CR-2)
10. [ ] Backup Strategy

---

## Migration Order for New Changes
1. **CR-7** first — Subscription enforcement (core business model)
2. **CR-2** — Language fields (additive, non-breaking)
3. **CR-5** — Recurring donation fields
4. **CR-4** — Sale-to-fee link fields
5. **CR-8** — Accounting mode field
6. **CR-11** — Storage limit fields
