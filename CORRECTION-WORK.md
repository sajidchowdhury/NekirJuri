# 🕌 Madrasha ERP — Correction & Enhancement Work

> **Generated**: Phase 12 post-completion analysis  
> **Purpose**: Categorize 11 change requests by discipline for systematic implementation  
> **Workflow**: Software Architect → Database Designer → Backend Lead → UI/UX Designer → Frontend Developer

---

## 📋 Change Requests Summary

| # | Request | Architect | DB Designer | Backend Lead | UI/UX Designer | Frontend Dev |
|---|---------|:---------:|:-----------:|:------------:|:-------------:|:------------:|
| 1 | Remove Bismillah from pages, keep in top bar | | | | ✅ | ✅ |
| 2 | 3-language system (Ar/En/Bn) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 | Product sale to student with monthly fee | ✅ | ✅ | ✅ | | ✅ |
| 5 | Recurring donations with reminders | ✅ | ✅ | ✅ | | ✅ |
| 6 | Fix New Sale modal (overlapping, mobile) | | | | ✅ | ✅ |
| 7 | SaaS subscription enforcement | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 | Simplified accounting mode | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 | Sidebar collapsible submenus | | | | ✅ | ✅ |
| 10 | Fee Category creation form | | | ✅ | ✅ | ✅ |
| 11 | Image upload limits per subscription | ✅ | ✅ | ✅ | | ✅ |

---

## 🏗️ 1. SOFTWARE ARCHITECT

### Change #2: Multi-Language System (Arabic / English / Bangla)

**Scope**: System-wide i18n architecture decision

**Architecture Decisions**:
- **Approach**: Use `next-intl` or custom context-based i18n (recommend `next-intl` for App Router compatibility)
- **Default Language**: English
- **Supported Languages**: `en` (English), `bn` (বাংলা), `ar` (العربية)
- **RTL Support**: Arabic requires full RTL layout flip (dir="rtl", sidebar right, text right-aligned)
- **Translation Storage**: JSON files in `/messages/en.json`, `/messages/bn.json`, `/messages/ar.json`
- **User Preference**: Store in `User.preferences.language` (DB) + cookie for unauthenticated pages
- **Dynamic Content**: User-entered data (student names, notices) stored in DB with optional `_bn` and `_ar` suffix fields
- **Settings Integration**: Language selector in `/system/settings` → Appearance section
- **Middleware**: Detect language from cookie/header, set `dir` and `lang` on `<html>`

**Key Considerations**:
- Arabic RTL will require CSS changes: `rtl:` Tailwind variants, sidebar position swap, table direction
- Bengali numerals (০১২৩) vs Arabic numerals (٠١٢) — decide whether to localize numbers or keep Western
- Translation keys: ~500-800 strings across the entire UI
- Date formatting: Hijri calendar for Arabic, Bengali calendar for Bangla
- Currency: ৳ remains same across languages but label changes ("Taka" / "টাকা" / "تاكا")

**Deliverables**:
- i18n architecture6 architecture document
- Translation key structure design
- RTL layout strategy document

---

### Change #4: Product Sale to Student with Monthly Fee Payment

**Scope**: Cross-module integration design (Inventory Sales ↔ Finance Fee Collection)

**Architecture Decisions**:
- When a sale is made to a **student** (identified by student ID), a new payment option appears: "Add to Monthly Fee"
- If selected, the sale amount is added to the student's fee invoice as a **"Product Purchase"** line item
- This creates a `FeeInvoiceItem` linked to the `Sale` record
- The amount then appears in Fee Collections under that student's outstanding invoices
- For **non-student** sales (walk-in customers), normal payment flow applies

**Data Flow**:
```
Sale (to student) → Payment Method: "Add to Fee"
  → Creates FeeInvoiceItem (categoryId: "product-purchase", saleId: link)
  → Student's fee invoice updated
  → Visible in Fee Collections payment details
```

**Deliverables**:
- Cross-module integration flow diagram
- API contract design for sale-to-fee linking

---

### Change #5: Recurring Donations with Monthly Reminders

**Scope**: Donation scheduling + notification system design

**Architecture Decisions**:
- New concept: **Recurring Donation** — a donor pledges to pay X amount monthly or yearly
- `Donation.isRecurring: Boolean` + `Donation.recurringFrequency: 'monthly' | 'yearly'`
- `Donation.nextDueDate: DateTime` — calculated from last payment + frequency
- **Reminder System**: Cron job (DAILY) checks for donations where `nextDueDate` is within 7 days
  - Sends notification to admin: "Donor [name] has a recurring donation of ৳[amount] due on [date]"
  - Sends email/SMS to donor (if consent given): "Your recurring donation of ৳[amount] is due"
- **Dashboard Widget**: Upcoming recurring donations in the next 30 days
- When donor pays, `nextDueDate` is auto-advanced by frequency period

**Deliverables**:
- Recurring donation flow diagram
- Cron job specification for reminder system
- Notification template design

---

### Change #7: SaaS Subscription Enforcement System

**Scope**: Core SaaS billing architecture — the most complex change

**Architecture Decisions**:

**Payment Plans**:
| Plan | Duration | Price |
|------|----------|-------|
| Monthly | 1 month | ৳X/month |
| Semi-Annual | 6 months | ৳X×6 (with discount) |
| Annual | 12 months | ৳X×12 (with bigger discount) |

**Payment Methods**: bKash, Nagad

**Enforcement Rules**:
| State | Condition | Access |
|-------|-----------|--------|
| **Active** | Payment within current period | Full access for all users |
| **Grace Period** | 1-14 days after due date | Full access, warning banner on all pages |
| **Restricted** | 15-30 days after due date | Only admin can login, READ-ONLY access (no insert/update/delete) |
| **Suspended** | 31+ days after due date | Only admin can login, READ-ONLY, data deletion warning |
| **Terminated** | 60+ days after due date | Data deleted (admin can still login to see empty system + payment prompt) |

**Key Flows**:
1. **Payment Check Middleware**: Every API request checks tenant subscription status
2. **Login Gate**: Auth checks subscription before allowing non-admin login
3. **Grace Period UI**: Yellow/amber banner on all pages: "Your subscription expires in X days. Renew now."
4. **Restricted Mode UI**: Red banner, all create/edit/delete buttons disabled, data shown as read-only
5. **Data Cleanup Job**: Cron job marks data for deletion after 60 days, permanently removes after 90 days
6. **Single Account Rule**: One email = one account (enforced at registration with unique constraint + email verification)

**Deliverables**:
- Subscription state machine diagram
- API middleware specification
- Data lifecycle policy document
- bKash/Nagad payment integration spec

---

### Change #8: Simplified Accounting Mode

**Scope**: Dual-mode accounting — Expert (double-entry) + Simplified (single-entry)

**Architecture Decisions**:
- **Two Modes**: "Expert Mode" (current double-entry) and "Simple Mode" (guided, single-entry-like)
- **Simple Mode Features**:
  - No manual journal entries — system auto-creates them behind the scenes
  - User-facing actions are simple: "Record Income", "Record Expense", "Transfer Money"
  - Each action auto-generates balanced journal entries
  - Chart of Accounts is pre-configured and hidden (user doesn't see account codes)
  - Reports are simplified: "Money In vs Money Out", "Category Summary"
  - No "debit/credit" terminology — uses "Money Received" / "Money Spent"
- **Mode Toggle**: In Settings → Finance section, switch between "Expert" and "Simple"
- **Migration**: Switching from Simple to Expert preserves all auto-generated entries
- **Default**: New tenants start in Simple Mode

**Simple Mode Mapping**:
| User Action | Auto Journal Entry |
|-------------|-------------------|
| "Record Income: ৳5,000 from Fees" | Debit: Cash ৳5,000, Credit: Fee Income ৳5,000 |
| "Record Expense: ৳2,000 for Electricity" | Debit: Electricity Expense ৳2,000, Credit: Cash ৳2,000 |
| "Transfer: ৳10,000 Cash → Bank" | Debit: Bank ৳10,000, Credit: Cash ৳10,000 |

**Deliverables**:
- Dual-mode accounting architecture document
- Simple mode → Expert mode mapping table
- UI flow for simplified accounting screens

---

### Change #11: Image Upload Limits per Subscription Tier

**Scope**: Storage policy design tied to subscription plans

**Architecture Decisions**:
- **Limits per Subscription Tier**:
  | Tier | Max Albums | Max Images/Album | Max Image Size | Total Storage |
  |------|-----------|-----------------|---------------|---------------|
  | Basic | 5 | 20 | 2 MB | 200 MB |
  | Standard | 15 | 50 | 5 MB | 3.75 GB |
  | Premium | 50 | 100 | 10 MB | 50 GB |
- **Enforcement**:
  - Before upload: Check current usage vs limit
  - Show usage bar in Gallery: "45/50 images used in this album"
  - Over-limit attempt: "Upgrade your plan to upload more images" with link to subscription
  - Image compression: Auto-resize images exceeding size limit (compress to max allowed)
- **Storage Tracking**: `Tenant.storageUsed` (Decimal, in MB), updated on every upload/delete
- **Cleanup**: Orphaned images (deleted from gallery but still in storage) cleaned by cron job

**Deliverables**:
- Storage policy specification
- Subscription tier limit matrix
- Image optimization pipeline design

---

## 🗄️ 2. DATABASE DESIGNER

### Change #2: Multi-Language Schema Changes

**New Fields**:
```prisma
model User {
  // ... existing
  language  String  @default("en")  // "en" | "bn" | "ar"
}

model Tenant {
  // ... existing
  defaultLanguage  String  @default("en")  // "en" | "bn" | "ar"
}

// For dynamic content with translations:
model Notice {
  // ... existing
  titleBn    String?  // Bengali title
  titleAr    String?  // Arabic title
  contentBn  String?  // Bengali content
  contentAr  String?  // Arabic content
}

// Similar _bn/_ar fields for:
// - FeeCategory (nameBn, nameAr)
// - ExpenseCategory (nameBn, nameAr)
// - DonationCategory (nameBn, nameAr)
// - Class (nameBn, nameAr)
// - Product (nameBn, nameAr)
// - ChartOfAccount (nameBn, nameAr)
// - WebsitePage (titleBn, titleAr, contentBn, contentAr)
```

---

### Change #4: Sale-to-Fee Integration Schema

**Modified Models**:
```prisma
model Sale {
  // ... existing
  studentId     Int?      // If sale is to a student (null = walk-in)
  student       Student?  @relation(fields: [studentId], references: [id])
  addToFee      Boolean   @default(false)  // Was this added to student's fee?
  feeInvoiceId  Int?      // Link to the fee invoice if addToFee is true
  feeInvoice    FeeInvoice? @relation(fields: [feeInvoiceId], references: [id])
}
```

---

### Change #5: Recurring Donation Schema

**Modified Models**:
```prisma
model Donation {
  // ... existing
  isRecurring        Boolean    @default(false)
  recurringFrequency String?    // "monthly" | "yearly" (null if one-time)
  recurringAmount    Decimal?   @db.Decimal(12,2)  // Pledged amount per period
  nextDueDate        DateTime?  // Next expected payment date
  reminderSent       Boolean    @default(false)  // Was reminder sent for next due?
  lastPaymentDate    DateTime?  // Date of last actual payment
}

model Donor {
  // ... existing
  totalPledged       Decimal    @default(0) @db.Decimal(12,2)  // Total recurring pledge
  reminderConsent    Boolean    @default(true)  // Donor agreed to receive reminders
  reminderMethod     String     @default("email")  // "email" | "sms" | "both"
}
```

---

### Change #7: Subscription Enforcement Schema

**Modified Models**:
```prisma
model Subscription {
  // ... existing — enhance with:
  status          String   @default("active")  // "active" | "grace" | "restricted" | "suspended" | "terminated"
  currentPeriodEnd DateTime  // When current paid period ends
  gracePeriodEnd    DateTime?  // currentPeriodEnd + 14 days
  restrictedEnd    DateTime?  // currentPeriodEnd + 30 days
  lastPaymentDate  DateTime?
  lastPaymentMethod String?  // "bkash" | "nagad"
  lastPaymentRef    String?  // Payment transaction reference
  dataDeletionDate  DateTime?  // When data will be deleted (60 days after due)
}

model User {
  // ... existing
  email  String  @unique  // Enforce single account per email (already unique)
  emailVerified  Boolean  @default(false)
}

model Tenant {
  // ... existing
  subscriptionStatus  String   @default("active")  // Cached from latest subscription
  isReadOnly          Boolean  @default(false)  // Quick check flag
  storageUsedMb       Decimal  @default(0) @db.Decimal(12,2)  // Track storage usage
}
```

**New Model**:
```prisma
model SubscriptionPayment {
  id              Int      @id @default(autoincrement())
  subscriptionId  Int
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  amount          Decimal  @db.Decimal(12,2)
  paymentMethod   String   // "bkash" | "nagad"
  transactionRef  String?  // bKash/Nagad transaction ID
  periodStart     DateTime
  periodEnd       DateTime
  status          String   @default("pending")  // "pending" | "verified" | "failed"
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  
  @@map("subscription_payments")
}
```

---

### Change #8: Simplified Accounting Schema

**Modified Models**:
```prisma
model Tenant {
  // ... existing
  accountingMode  String  @default("simple")  // "simple" | "expert"
}
```

No other schema changes needed — the existing double-entry tables (ChartOfAccount, JournalEntry, etc.) remain. Simple mode just auto-generates entries via backend logic.

---

### Change #11: Storage Limits Schema

**Modified Models**:
```prisma
model SubscriptionPlan {
  // ... existing
  maxAlbums       Int     @default(5)    // Max gallery albums
  maxImagesPerAlbum Int   @default(20)   // Max images per album
  maxImageSizeMb  Int     @default(2)    // Max single image size in MB
  maxStorageMb    Int     @default(200)  // Total storage in MB
}

model GalleryAlbum {
  // ... existing
  imageCount      Int     @default(0)  // Cached count for quick limit checks
}
```

---

## ⚙️ 3. SOFTWARE DEVELOPER (BACKEND LEAD)

### Change #2: Multi-Language Backend

**API Changes**:
- `GET /api/[resource]?lang=bn` — Return localized content
- `PATCH /api/users/:id/language` — Update user language preference
- `GET /api/settings/language` — Get tenant default language
- **Middleware**: Set `Accept-Language` header processing
- **Translation serving**: API returns `{ name: "Admission Fee", nameBn: "ভর্তি ফি", nameAr: "رسوم القبول" }` — frontend picks based on active language

---

### Change #4: Sale-to-Fee Backend Logic

**API Changes**:
- `POST /api/sales` — Enhanced to handle `studentId` + `addToFee: true`
  - If `addToFee` is true AND `studentId` is provided:
    1. Create the Sale record
    2. Find or create the student's current month fee invoice
    3. Add `FeeInvoiceItem` with `categoryId = "product-purchase"`, linked to sale
    4. Return success with both sale and invoice info
- `GET /api/fee-collections/:studentId` — Include product purchase items in outstanding invoices

---

### Change #5: Recurring Donation Backend

**API Changes**:
- `POST /api/donations` — If `isRecurring: true`, calculate and store `nextDueDate`
- `PATCH /api/donations/:id/pay` — Record a recurring payment, advance `nextDueDate`
- **Cron Job** (daily at 9:00 AM):
  1. Find all `Donation` where `isRecurring = true` AND `nextDueDate` is within next 7 days AND `reminderSent = false`
  2. For each: Create notification for admin, send email/SMS to donor (if consent)
  3. Mark `reminderSent = true`
  4. Reset `reminderSent = false` when `nextDueDate` passes (for next cycle)

---

### Change #7: Subscription Enforcement Backend

**Critical Backend Logic**:

1. **Middleware/Guard on EVERY API route**:
   ```typescript
   // Pseudocode for API middleware
   if (tenant.isReadOnly) {
     if (method !== 'GET' && user.role !== 'super_admin') {
       return 403 { error: 'Subscription expired. Read-only mode.' }
     }
   }
   ```

2. **Login Gate**:
   ```typescript
   // In auth flow
   const subscription = await getLatestSubscription(tenantId)
   if (isExpired(subscription) && user.role !== 'super_admin') {
     return 403 { error: 'Subscription expired. Contact admin.' }
   }
   ```

3. **Subscription Status Cron Job** (daily):
   - Check all tenants with `subscription.currentPeriodEnd < now`
   - Update status: active → grace (0-14 days) → restricted (15-30 days) → suspended (31-59 days) → terminated (60+ days)
   - Set `tenant.isReadOnly = true` when restricted or beyond

4. **Data Deletion Cron Job** (daily):
   - Find tenants in `terminated` status for 30+ days
   - Delete allAALL business data (students, invoices, donations, etc.)
   - Keep: Tenant record, User records (admin only), Subscription records
   - Log deletion in audit trail

5. **bKash/Nagad Payment Integration**:
   - Use b(https://developer.bkash.com/) and Nagad merchant API
   - Payment flow: Redirect → Pay → Callback → Verify → Activate subscription
   - Store transaction reference in `SubscriptionPayment`

6. **Email Uniqueness Enforcement**:
   - Registration API: Check `email` uniqueness globally (not per-tenant)
   - Email verification: Send OTP, verify before allowing login
   - Prevent multiple accounts: `User.email` is `@unique` in schema

---

### Change #8: Simplified Accounting Backend

**New API Endpoints**:
```
POST /api/accounting/simple/income    — Record income (auto-creates journal entry)
POST /api/accounting/simple/expense   — Record expense (auto-creates journal entry)
POST /api/accounting/simple/transfer  — Transfer between accounts
GET  /api/accounting/simple/summary   — Simple summary (money in vs out)
```

**Auto-Journal Logic**:
```typescript
// When user records income in Simple Mode:
async function recordSimpleIncome(amount, source, description) {
  // Auto-create balanced journal entry
  await createJournalEntry({
    lines: [
      { account: 'Cash in Hand', debit: amount },
      { account: sourceAccount(source), credit: amount },
    ],
    description,
    autoGenerated: true,
    mode: 'simple'
  })
}
```

---

### Change #10: Fee Category Creation API

**New Endpoint**:
```
POST /api/fee-categories — Create fee category (currently missing)
PATCH /api/fee-categories/:id — Update fee category
DELETE /api/fee-categories/:id — Delete fee category (soft delete)
```

This is currently a UI-only placeholder. Backend CRUD API needs to be built.

---

### Change #11: Upload Limit Enforcement Backend

**API Changes**:
- `POST /api/gallery/upload` — Before accepting upload:
  1. Get tenant's subscription plan limits
  2. Check album count vs `maxAlbums`
  3. Check image count in album vs `maxImagesPerAlbum`
  4. Check file size vs `maxImageSizeMb`
  5. Check total storage vs `maxStorageMb`
  6. If any limit exceeded, return 413 with specific limit info
  7. If OK, compress image if needed, save, update `tenant.storageUsedMb`

---

## 🎨 4. UI/UX DESIGNER

### Change #1: Bismillah Placement

**Current State**: `BismillahHeader` shown on every page via `PageHeader showBismillah` prop

**New Design**:
- **Remove** `showBismillah` from all `PageHeader` components across all pages
- **Add** Bismillah to the **top bar (AppHeader)** — centered, subtle, small font
  - Position: Between breadcrumb (left) and action buttons (right)
  - Style: `text-xs text-muted-foreground font-arabic opacity-60`
  - Hidden on mobile (too cramped) — only visible on `md:` and above
  - Still shown prominently on **print layouts** and **financial reports** (Trial Balance, Income Statement, Balance Sheet, Payslip, Receipt)

**Pages to Update** (remove showBismillah from PageHeader):
- All academic pages (: students, teachers, employees, classes, sessions, promotions)
- All finance pages (fees, collections, donations, expenses, payroll)
- All inventory pages (products, purchases, stock, sales)
- All accounting pages (chart-of-accounts, journal-entries)
- All website pages (pages, notices, gallery)
- All system pages (users, notifications, activity-logs, settings)

---

### Change #2: Language Switcher UI

**Design**:
- **Location**: AppHeader (top bar), right side — before theme toggle
- **Component**: Globe icon + current language code dropdown
  - 🌐 EN ▾ → English / বাংলা / العربية
- **Settings Page**: Appearance section — Language selector (more prominent, with flag/emoji)
- **RTL Handling**: When Arabic selected:
  - `<html dir="rtl">`
  - Sidebar moves to right
  - Text alignment flips
  - Navigation order reverses
  - Use Tailwind `rtl:` variants throughout

---

### Change #6: Fix New Sale Modal

**Current Issues**:
- Product selected and Qty input fields overlapping
- Not mobile-friendly

**Fixes**:
- **Layout**: Stack fields vertically on mobile (full width each)
- **Product Select**: Full width, clear label "Select Product", show stock count
- **Qty Input**: Full width below product, with +/- stepper buttons for easy mobile use
- **Price**: Auto-filled, shown as read-only with lock icon
- **Line Items**: Card-based layout instead of cramped inline rows
  - Each line item = a card with: Product name (bold), Qty × Price = Total
  - Delete button on each card
- **Dialog Size**: `max-w-2xl` on desktop, full-screen sheet on mobile
- **Mobile**: Use `Drawer` (bottom sheet) instead of `Dialog` on mobile

---

### Change #7: Subscription UI States

**Design for Each State**:

1. **Active**: Normal UI, no banner
2. **Grace Period** (0-14 days overdue):
   - **Amber banner** at top of ALL pages (sticky, below header):
   - "⚠️ Your subscription expires in X days. [Renew Now →]"
   - "Renew Now" button → opens payment page (bKash/Nagad)
![](https://via.placeholder.com/15/f59e0b/000000?text=+) Amber
3. **Restricted** (15-30 days overdue):
   - **Red banner**: "🚫 Subscription expired. System is in read-only mode. [Renew Now →]"
   - All CREATE/EDIT/DELETE buttons **disabled** with tooltip "Not available in read-only mode"
   - All forms show "Read-only" badge
   - Only admin can see this state
4. **Suspended** (31-59 days overdue):
   - **Dark red banner**: "🚫 DATA AT RISK — Renew within X days or data will be permanently deleted."
   - Countdown timer to deletion date
5. **Login Gate** (for non-admin users):
   - Login page shows: "This institution's subscription has expired. Please contact your administrator."

**Payment Page Design**:
- Plan cards: Monthly / 6-Month / 12-Month (gold border on recommended)
- Payment method: bKash (pink) / Nagad (orange) — with logos
- Payment flow: Select plan → Select method → Redirect to payment → Return to app

---

### Change #8: Simplified Accounting UI

**Simple Mode Screens**:

1. **Dashboard** (replaces Chart of Accounts + Journal Entries):
   - "Money In" card (total income this month) — emerald
   - "Money Out" card (total expenses this month) — rose
   - "Balance" card (in - out) — gold
   - Simple pie chart: Income by category, Expenses by category

2. **Record Income** (replaces Journal Entry):
   - Simple form: Source (select: Fee Collection / Donation / Sales / Other), Amount (৳), Date, Note
   - No debit/credit terminology

3. **Record Expense** (replaces Journal Entry):
   - Simple form: Category (select: Salary / Utilities / Maintenance / Supplies / Food / Other), Amount (৳), Date, Note

4. **Simple Reports** (replaces Trial Balance / Income Statement / Balance Sheet):
   - "Income vs Expenses" — bar chart
   - "Category Breakdown" — pie chart
   - "Monthly Trend" — line chart
   - "Download Report" button

5. **Mode Toggle**: Settings → Finance → "Accounting Mode" with explanation:
   - Simple: "Easy tracking of money in and out. Best for users without accounting knowledge."
   - Expert: "Full double-entry accounting with journal entries. Best for users with accounting experience."

---

### Change #9: Sidebar Collapsible Submenus

**Current State**: All groups and items are always visible (flat list)

**New Design**:
- **Navigation groups** (ACADEMIC, FINANCE, etc.) are **collapsible**
- **Default state**: Only the group containing the current active route is expanded
- **Click behavior**:
  - Click a group header → Toggle that group (expand if collapsed, collapse if expanded)
  - When expanding a group, **collapse all other groups** (accordion behavior)
  - Active item's group is always expanded
- **Visual**:
  - Group header: Clickable, shows `ChevronRight` that rotates to `ChevronDown` when expanded
  - Smooth height transition (Framer Motion `AnimatePresence` with `layout`)
  - Active item: Emerald highlight as current
- **Mobile**: Sheet sidebar uses same accordion behavior

---

### Change #10: Fee Category Form UI

**Current State**: Placeholder message: "Fee category creation form will be available in the next update"

**New Design**:
- **Full CRUD form** in Dialog (like other forms in the system)
- Fields: Name (En), Name (Bn), Amount (৳), Frequency (monthly/quarterly/annual/one-time), Description
- Inline edit capability in the fee category card grid
- Delete with confirmation dialog
- Standard react-hook-form + zod validation

---

## 💻 5. FRONTEND DEVELOPER

> These are tasks the dedicated Frontend Developer will implement after the above architecture, database, and backend work is complete.

### Change #1: Bismillah Removal
- Remove `showBismillah` prop from all `PageHeader` instances (~30 pages)
- Add `BismillahHeader` to `AppHeader` component (centered, subtle, hidden on mobile)
- Keep Bismillah on print layouts (reports, payslips, receipts)

### Change #2: Multi-Language Frontend
- Install and configure `next-intl`
- Create translation JSON files (`/messages/en.json`, `bn.json`, `ar.json`)
- Wrap app in `NextIntlClientProvider`
- Create `LanguageSwitcher` component in AppHeader
- Replace all hardcoded strings with translation keys (~500-800 strings)
- Implement RTL support with Tailwind `rtl:` variants
- Language preference in Settings page
- Dynamic content: Show `_bn`/`_ar` fields based on active language

### Change #4: Sale-to-Student Integration
- Add "Sell to Student" option in Sales form
- Student search/selector when "Sell to Student" is checked
- "Add to Monthly Fee" payment method option (only when student selected)
- Show product purchases in Fee Collections details

### Change #5: Recurring Donation UI
- Add recurring toggle in DonationForm: "One-time" / "Monthly" / "Yearly"
- Show next due date for recurring donations
- Upcoming Recurring Donations widget on Donations dashboard
- Reminder indicator (bell icon) on due donations

### Change #6: New Sale Modal Fix
- Redesign SalesForm line items layout
- Vertical stacking on mobile
- Card-based line items
- Use Drawer on mobile instead of Dialog
- +/- stepper for quantity

### Change #7: Subscription UI
- Subscription status banner component (amber/red/dark-red)
- Read-only mode: Disable all create/edit/delete buttons
- Login gate for expired subscriptions
- Payment page with bKash/Nagad integration
- Plan selection cards
- Subscription management in Settings

### Change #8: Simplified Accounting UI
- Accounting mode toggle in Settings
- Simple mode screens: Record Income, Record Expense, Simple Reports
- Expert mode: Current screens (Chart of Accounts, Journal Entries, Financial Reports)
- Conditional routing based on accounting mode

### Change #9: Sidebar Accordion
- Refactor AppSidebar to use accordion/collapsible groups
- Track expanded state, auto-expand active group
- Collapse others on expand (accordion behavior)
- Smooth Framer Motion height transitions

### Change #10: Fee Category Form
- Build FeeCategoryForm component (react-hook-form + zod)
- Wire to backend API (POST/PUT/DELETE /api/fee-categories)
- Replace placeholder message

### Change #11: Upload Limits UI
- Show storage usage bar in Gallery
- Limit enforcement messages: "Album limit reached", "Image size too large"
- Upgrade prompt when limits hit: "Upgrade your plan to upload more"
- Image compression indicator during upload

---

## 📊 Priority & Implementation Order

### Phase A — Critical (Do First)
1. **Change #7** — SaaS Subscription Enforcement (core business model, blocks everything)
2. **Change #9** — Sidebar Collapsible Submenus (UX fix, quick win)
3. **Change #1** — Bismillah Placement (quick fix)
4. **Change #6** — Sale Modal Fix (bug fix)

### Phase B — High Priority
5. **Change #2** — Multi-Language System (major feature, large scope)
6. **Change #8** — Simplified Accounting (core usability for target users)
7. **Change #4** — Sale-to-Student Fee Integration (business logic)

### Phase C — Medium Priority
8. **Change #5** — Recurring Donations (important feature)
9. **Change #10** — Fee Category Form (feature completion)
10. **Change #11** — Image Upload Limits (storage management)

---

## 🔗 Dependencies

```
Change #7 (Subscription) ──→ Change #11 (Upload Limits) [limits tied to subscription tier]
Change #2 (i18n) ──→ Change #1 (Bismillah) [Bismillah text needs Arabic rendering]
Change #8 (Simple Accounting) ──→ Change #4 (Sale-to-Fee) [simple mode needs income recording]
Change #7 (Subscription) ──→ Change #5 (Recurring Donations) [reminder cron needs infra]
```

---

*This document serves as the master reference for all post-Phase-12 correction work. Each discipline should create their own detailed implementation plan based on their sections above.*
