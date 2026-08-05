
# Database Design Specification
## Madrasha ERP & Accounting Management System (SaaS)
Version: 1.0

## Purpose
This document is written for the Database Designer. It translates the approved master specification into database architecture requirements.

## Database Platform
Recommended: PostgreSQL

Reasons:
- Better integrity and constraints
- Excellent support for SaaS multi-tenancy
- Strong indexing and reporting performance
- JSONB support for future configurable modules
- Mature transactional engine

## Architectural Principles
- Multi-tenant using tenant_id on every business table.
- Use bigint identity primary keys.
- UUID may be exposed publicly.
- Soft delete where business requires.
- created_at, updated_at on all tables.
- deleted_at on transactional tables.
- Audit logging for critical operations.

## Core Schemas / Domains
1. SaaS
   - tenants
   - subscription_plans
   - subscriptions

2. Security
   - users
   - roles
   - permissions
   - role_permission
   - user_role

3. Academic
   - academic_sessions
   - classes
   - sections
   - students
   - guardians
   - student_guardians
   - teachers
   - employees

4. Finance
   - fee_categories
   - fee_invoices
   - fee_invoice_items
   - fee_collections
   - donation_categories
   - donors
   - donations
   - expense_categories
   - expenses
   - salary_structures
   - salary_payments

5. Inventory
   - suppliers
   - product_categories
   - products
   - purchases
   - purchase_items
   - stock_movements
   - sales_invoices
   - sales_items

6. CMS
   - website_pages
   - notices
   - galleries

7. System
   - settings
   - notifications
   - activity_logs
   - audit_logs

## Mandatory Columns
Every business table:
- id
- tenant_id
- created_at
- updated_at
Optional:
- deleted_at
- created_by
- updated_by

## Relationship Rules
- One Tenant -> Many Users
- One Tenant -> Many Students
- One Student -> Many Fee Invoices
- One Teacher -> Many Salary Payments
- One Product -> Many Stock Movements
- One Supplier -> Many Purchases
- One Sales Invoice -> Many Sales Items

## Index Strategy
Index:
- tenant_id
- status
- created_at
- invoice_no
- receipt_no
- roll_no
- student_id
Composite indexes:
- (tenant_id,status)
- (tenant_id,created_at)
- (tenant_id,class_id)

## Constraints
- Foreign keys everywhere practical.
- Prevent cross-tenant references.
- Unique:
  - tenant_id + username
  - tenant_id + student_registration
  - tenant_id + invoice_number

## Reporting Considerations
Design optimized for:
- Daily cash report
- Monthly income/expense
- Donation summary
- Outstanding fees
- Stock valuation
- Salary register

## Naming Standards
- snake_case
- Singular table names optional, but stay consistent.
- Foreign keys: table_id
- Junction tables: entity_entity

## Deliverables
1. Complete ER Diagram
2. Data Dictionary
3. Table Definitions
4. Relationships
5. Index Plan
6. Constraints
7. Migration Order
8. Seed Data Plan
9. Backup Strategy
10. Versioned Migration Scripts

## Handover
After ERD approval, Backend Architecture starts. UI design should follow approved entities and workflows—not precede them.
