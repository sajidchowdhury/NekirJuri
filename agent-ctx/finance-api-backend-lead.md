---
Task ID: finance-api
Agent: Backend Lead
Task: Create Finance Domain API Routes (Fees, Donations, Expenses)

Work Log:
- Read worklog.md — understood existing DB schema (46 tables), seed data, and project architecture
- Read prisma/schema.prisma — mapped all Finance domain models (FeeCategory, FeeStructure, FeeInvoice, FeeInvoiceItem, FeeCollection, FeeDiscount, DonationCategory, Donor, Donation, ExpenseCategory, Expense)
- Read lib/api-utils.ts — confirmed available helpers (success, created, error, notFound, paginated, getPaginationParams, getTenantId, getUserId, requireTenantId)
- Read lib/types.ts — verified input type interfaces for all Finance entities

Created 11 API Route Files:

1. /src/app/api/fee-categories/route.ts
   - GET: paginated list with search (name/code)
   - POST: create with unique code validation

2. /src/app/api/fee-structures/route.ts
   - GET: paginated list with filters (classId, academicSessionId, feeCategoryId), includes relations
   - POST: create with composite unique check (tenant+class+fee+session)

3. /src/app/api/fee-invoices/route.ts
   - GET: paginated list with filters (studentId, status, classId, academicSessionId), includes student + items
   - POST: create invoice + items in $transaction, auto-generate INV-{year}-{seq}, calculate totalAmount from sum of item netAmounts

4. /src/app/api/fee-invoices/[id]/route.ts
   - GET: single invoice with items, collections, discounts
   - PUT: update status/remarks/fineAmount/discountAmount with auto-recalculation of balance

5. /src/app/api/fee-collections/route.ts
   - GET: paginated list with filters (invoiceId, studentId, paymentMethod)
   - POST: collect payment in $transaction — create collection (RCT-{year}-{seq}), update invoice paidAmount/balance/status, validation that payment ≤ balance

6. /src/app/api/fee-discounts/route.ts
   - GET: paginated list with filters (studentId, invoiceId, status)
   - POST: create discount/waiver with validation (percentage ≤ 100, positive value, valid types)

7. /src/app/api/donation-categories/route.ts
   - GET: paginated list with search
   - POST: create

8. /src/app/api/donors/route.ts
   - GET: paginated list with multi-field search (name/phone/email/organization/nidNo), isRegular/isActive filters
   - POST: create

9. /src/app/api/donations/route.ts
   - GET: paginated list with filters (categoryId, donorId, status, paymentMethod, dateFrom/dateTo)
   - POST: create with auto-generated DON-{year}-{seq}, validates category and donor belong to tenant

10. /src/app/api/expense-categories/route.ts
    - GET: paginated list with search, includes expense count
    - POST: create with unique code validation

11. /src/app/api/expenses/route.ts
    - GET: paginated list with filters (categoryId, status, paymentMethod, dateFrom/dateTo)
    - POST: create with auto-generated EXP-{year}-{seq}, validates category belongs to tenant

Key Implementation Details:
- All routes enforce multi-tenancy via requireTenantId (x-tenant-id header)
- All list endpoints support pagination (page, limit), search, sortBy, sortOrder
- Auto-generated numbers: INV-{year}-{seq}, RCT-{year}-{seq}, DON-{year}-{seq}, EXP-{year}-{seq} — zero-padded to 5 digits
- Fee-collections POST uses $transaction to atomically create collection + update invoice (paidAmount, balance, status with float tolerance 0.01)
- Fee-invoices POST uses $transaction to create invoice + items together, totalAmount = Σ netAmount
- All create/update operations log to AuditLog with action, entityType, entityId, oldValues/newValues
- ESLint: 0 errors (1 pre-existing warning in auth.ts, unrelated)
- Dev server: running cleanly
