---
Task ID: 3
Agent: Backend Lead
Task: Create API routes for Salary/Payroll, Accounting, and Inventory modules

Work Log:
- Read worklog.md to understand existing project context (46 tables, seed data, api-utils)
- Analyzed full Prisma schema for all 10 relevant models: SalaryStructure, SalaryPayment, ChartOfAccount, JournalEntry, JournalEntryItem, Supplier, ProductCategory, Product, Purchase, PurchaseItem, StockMovement, SalesInvoice, SalesItem, AuditLog
- Reviewed api-utils.ts helpers (success, created, error, paginated, getPaginationParams, getTenantId, getUserId)
- Reviewed types.ts for all input interfaces
- Created 10 production-ready API route files

SALARY & PAYROLL (2 routes):
1. /api/salary-structures — GET (list, filter by employeeType/isActive), POST (create with auto-calc of totalSalary and netSalary)
2. /api/salary-payments — GET (list, filter by month/year/employeeType/status), POST (process payment with duplicate check, fetch salary structure for breakdown)

ACCOUNTING (2 routes):
3. /api/accounts — GET (list chart of accounts, filter by accountType/parentId/isActive), POST (create with code uniqueness check, parent validation, auto-set currentBalance = openingBalance)
4. /api/journal-entries — GET (list, filter by status/date range/referenceType), POST (create entry AND items, validate totalDebit === totalCredit within 0.01 tolerance, update account currentBalance per account type rules)

INVENTORY (6 routes):
5. /api/suppliers — GET (list with search across name/code/phone/email/contactPerson, soft-delete filter), POST (create with code uniqueness check)
6. /api/product-categories — GET (list with parent/children hierarchy, product count), POST (create with parent validation)
7. /api/products — GET (list with search, filter by categoryId, low stock alert where currentStock <= minStockLevel), POST (create with code uniqueness check, category validation)
8. /api/purchases — GET (list, filter by supplierId/status/paymentStatus/date), POST (create purchase AND items in transaction, update product.currentStock += quantity, create stockMovement type='in')
9. /api/stock-movements — GET (list, filter by productId/movementType/referenceType/date), POST (manual adjustment supporting in/out/adjustment/transfer, stock validation for out movements)
10. /api/sales — GET (list, filter by studentId/status/paymentStatus/date), POST (create invoice AND items in transaction, stock availability check, update product.currentStock -= quantity, create stockMovement type='out')

Key Implementation Details:
- All routes use NextRequest from next/server with async GET/POST handlers
- Multi-tenancy enforced via getTenantId(request) with x-tenant-id header
- All mutations wrapped in try/catch with error() helper
- Complex mutations (purchases, sales, journal entries) use db.$transaction() for atomicity
- Audit logging on all LIST and CREATE operations via AuditLog model
- Pagination via getPaginationParams() with paginated() response helper
- Soft-delete filtering (deletedAt: null) on Supplier and Product queries
- Journal entry balance validation with 0.01 tolerance for floating point
- Account balance updates follow double-entry rules (debit/credit per account type)
- Stock availability validation before sales
- Duplicate payment check for salary payments (per employee/month/year)
- Low stock detection uses in-memory filter for currentStock <= minStockLevel comparison

Lint: Passed (0 errors, 1 pre-existing warning unrelated to our code)
