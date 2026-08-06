# 🕌 Madrasha ERP — UI/UX Implementation Roadmap

> **Project**: Madrasha ERP & Accounting Management System (SaaS)  
> **Stack**: Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion · Recharts  
> **Design Philosophy**: *Islamic elegance meets modern productivity* — Clean, premium, mobile-first  
> **Version**: 1.0 · **Last Updated**: August 2025

---

## 🎨 Design Identity — "Islamic Modern Premium"

### Core Principle
> *"Simplicity is the ultimate sophistication"* — Every screen should feel like walking into a well-designed masjid courtyard: **spacious, calm, purposeful, and beautiful.**

### Islamic Design DNA
- **Geometric harmony** — Subtle geometric patterns as decorative accents (not overwhelming)
- **Calligraphic influence** — Arabic/Bengali typography treated with respect and proper font pairing
- **Arch motif** — Soft arch shapes for cards, modals, and containers (inspired by Islamic architecture)
- **Generous whitespace** — Reflects the spaciousness of Islamic architecture
- **Green as sacred** — Emerald/jade green as the primary brand color (color of Islam)
- **Gold as accent** — Warm gold for highlights, CTAs, and premium features
- **Symmetry & order** — Balanced layouts reflecting geometric precision

---

## 🌈 Color System — "Emerald & Gold"

### Primary Palette

| Token | Color | Hex | OKLCH | Usage |
|-------|-------|-----|-------|-------|
| `--primary` | Emerald 700 | `#047857` | `oklch(0.48 0.16 163)` | Buttons, active states, links, primary actions |
| `--primary-foreground` | White | `#ffffff` | `oklch(1 0 0)` | Text on primary backgrounds |
| `--primary-soft` | Emerald 50 | `#ecfdf5` | `oklch(0.97 0.02 163)` | Subtle backgrounds, hover states |
| `--primary-muted` | Emerald 100 | `#d1fae5` | `oklch(0.94 0.05 163)` | Badges, tags, soft highlights |

### Accent Palette (Gold)

| Token | Color | Hex | OKLCH | Usage |
|-------|-------|-----|-------|-------|
| `--accent` | Amber 600 | `#d97706` | `oklch(0.68 0.15 75)` | Premium indicators, CTAs, notifications |
| `--accent-foreground` | Amber 900 | `#78350f` | `oklch(0.38 0.08 75)` | Text on gold backgrounds |
| `--accent-soft` | Amber 50 | `#fffbeb` | `oklch(0.99 0.02 85)` | Gold tint backgrounds |

### Semantic Colors

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--destructive` | Rose 600 | `#e11d48` | Errors, delete actions, overdue |
| `--warning` | Amber 500 | `#f59e0b` | Warnings, pending states |
| `--success` | Emerald 500 | `#10b981` | Success, completed, paid |
| `--info` | Sky 600 | `#0284c7` | Information, tooltips |

### Neutral Palette (Warm Gray — not cold blue-gray)

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--background` | Warm White | `#fafaf7` | Page background |
| `--card` | Pure White | `#ffffff` | Card surfaces |
| `--muted` | Stone 100 | `#f5f5f4` | Muted backgrounds |
| `--border` | Stone 200 | `#e7e5e4` | Borders, dividers |
| `--foreground` | Stone 900 | `#1c1917` | Primary text |
| `--muted-foreground` | Stone 500 | `#78716c` | Secondary text |

### Dark Mode Palette

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--background` | Stone 950 | `#0c0a09` | Page background |
| `--card` | Stone 900 | `#1c1917` | Card surfaces |
| `--primary` | Emerald 400 | `#34d399` | Buttons, active states |
| `--accent` | Amber 400 | `#fbbf24` | Gold accent |
| `--foreground` | Stone 50 | `#fafaf9` | Primary text |

### Chart Colors (Data Visualization)

| Index | Color | Hex | Usage |
|-------|-------|-----|-------|
| `--chart-1` | Emerald 500 | `#10b981` | Primary data series |
| `--chart-2` | Amber 500 | `#f59e0b` | Secondary series |
| `--chart-3` | Sky 500 | `#0ea5e9` | Tertiary series |
| `--chart-4` | Rose 400 | `#fb7185` | Contrast series |
| `--chart-5` | Violet 400 | `#a78bfa` | Additional series |

---

## 🔤 Typography System

### Font Stack

| Purpose | Font | Fallback | Weight |
|---------|------|----------|--------|
| **English UI** | Inter (Google Fonts) | system-ui, sans-serif | 400, 500, 600, 700 |
| **Bangla UI** | Noto Sans Bengali | sans-serif | 400, 500, 600, 700 |
| **Arabic** | Noto Naskh Arabic | serif | 400, 500 |
| **Monospace** | JetBrains Mono | monospace | 400 (for codes/IDs) |

### Type Scale

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 2.25rem (36px) | 700 | 1.2 | Dashboard hero stats |
| `h1` | 1.875rem (30px) | 700 | 1.3 | Page titles |
| `h2` | 1.5rem (24px) | 600 | 1.3 | Section headings |
| `h3` | 1.25rem (20px) | 600 | 1.4 | Card titles |
| `h4` | 1.125rem (18px) | 500 | 1.4 | Sub-sections |
| `body` | 0.875rem (14px) | 400 | 1.6 | Body text, table cells |
| `caption` | 0.75rem (12px) | 400 | 1.5 | Labels, badges, timestamps |
| `micro` | 0.625rem (10px) | 500 | 1.4 | Overlines, tiny badges |

---

## 📐 Spacing & Layout System

### Spacing Scale (4px base)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

### Container Widths

| Breakpoint | Sidebar | Content | Max-width |
|------------|---------|---------|-----------|
| Mobile (<640px) | Hidden (sheet overlay) | Full width | 100% |
| Tablet (640-1024px) | Collapsed (icons only, 64px) | Fluid | 100% |
| Desktop (1024-1440px) | Expanded (256px) | Fluid | 100% |
| Wide (>1440px) | Expanded (280px) | Centered | 1440px |

### Card System
- **Border radius**: `0.75rem` (12px) — soft but not pill-shaped
- **Padding**: `p-6` (24px) for content cards, `p-4` (16px) for compact cards
- **Gap**: `gap-6` between cards in grid
- **Shadow**: `shadow-sm` default, `shadow-md` on hover/elevated
- **Border**: `1px solid var(--border)` — subtle, always present

### Islamic Arch Border Radius
- For hero cards and stat cards: Use a custom `border-radius` with a subtle arch shape on top — `12px 12px 12px 12px` with an optional decorative top border in `--primary` color (3px)

---

## 📱 Responsive Strategy — Mobile-First

### Breakpoint Behavior

| Breakpoint | Sidebar | Navigation | Tables | Forms |
|------------|---------|------------|--------|-------|
| **Mobile** (<640px) | Sheet overlay | Bottom tab bar | Card list view | Full-width stacked |
| **Tablet** (640-1024px) | Collapsed icon rail | Top breadcrumb | Responsive table | 2-column grid |
| **Desktop** (1024px+) | Full sidebar | Sidebar + breadcrumb | Full data table | 3-column grid |

### Mobile-Specific Patterns
- **Bottom tab bar** for main navigation (5-7 items max)
- **Swipe gestures** for card actions (edit, delete)
- **Pull-to-refresh** for data lists
- **FAB (Floating Action Button)** for primary create actions
- **Sheet/Drawer** for forms instead of modals
- **Card list** instead of tables for data display
- **Collapsible sections** for long forms

---

## 🧩 Component Architecture

### Atomic Design Structure

```
src/components/
├── ui/              ← shadcn/ui (atoms — already installed)
├── atoms/           ← Custom atoms (icons, avatars, badges, status dots)
├── molecules/       ← Composed pieces (stat cards, search bars, user rows)
├── organisms/       ← Complex blocks (data tables, forms, charts, filters)
├── templates/       ← Page layouts (dashboard layout, form layout, list layout)
└── islamic/         ← Islamic decorative components (patterns, arches, bismillah)
```

### Islamic Decorative Components

| Component | Description | Where Used |
|-----------|-------------|------------|
| `IslamicPattern` | SVG geometric pattern (subtle, low opacity) | Card backgrounds, page headers |
| `ArchCard` | Card with Islamic arch-shaped top border | Hero stats, welcome cards |
| `BismillahHeader` | "بسم الله الرحمن الرحيم" in Arabic calligraphy | Report headers, print layouts |
| `GeometricDivider` | SVG geometric line divider | Section separators |
| `CrescentIcon` | Crescent moon icon (Islamic symbol) | Logo, loading states |
| `ArabicText` | Proper RTL Arabic text wrapper | Any Arabic content |

---

## 🗺️ Navigation Architecture

### Sidebar Structure (Desktop)

```
┌─────────────────────────────┐
│  🕌 Madrasha ERP            │  ← Logo + Tenant name
│  ─────────────────────────  │
│  📊 Dashboard               │
│  ─────────────────────────  │
│  🎓 ACADEMIC                │  ← Section header
│    ├── 📋 Students          │
│    ├── 👨‍🏫 Teachers           │
│    ├── 👨‍💼 Employees          │
│    ├── 🏫 Classes            │
│    ├── 📅 Academic Session   │
│    └── ⬆ Promotions         │
│  ─────────────────────────  │
│  💰 FINANCE                 │
│    ├── 🧾 Fee Management    │
│    ├── 💵 Fee Collection     │
│    ├── 🤝 Donations         │
│    ├── 📤 Expenses          │
│    └── 💲 Salary/Payroll     │
│  ─────────────────────────  │
│  📦 INVENTORY               │
│    ├── 🏷️ Products           │
│    ├── 🛒 Purchases          │
│    ├── 📊 Stock              │
│    └── 🧮 Sales              │
│  ─────────────────────────  │
│  📒 ACCOUNTING              │
│    ├── 📖 Chart of Accounts  │
│    └── 📝 Journal Entries    │
│  ─────────────────────────  │
│  🌐 WEBSITE                 │
│    ├── 📄 Pages             │
│    ├── 📢 Notices           │
│    └── 🖼️ Gallery            │
│  ─────────────────────────  │
│  ⚙️ SYSTEM                  │
│    ├── 👥 Users & Roles      │
│    ├── 🔔 Notifications     │
│    ├── 📊 Activity Logs      │
│    └── 🔧 Settings           │
└─────────────────────────────┘
```

### Mobile Bottom Tab Bar

```
┌──────┬──────┬──────┬──────┬──────┐
│ 📊   │ 🎓   │ 💰   │ 📦   │ ⚙️   │
│Home  │Learn │Finance│Store │More  │
└──────┴──────┴──────┴──────┴──────┘
```

---

## 📋 PHASE-BY-PHASE IMPLEMENTATION

---

## Phase 0 — Design System Foundation

**Goal**: Set up the entire design system, theme, and reusable base components.  
**Duration**: ~1 session  
**Dependencies**: None  
**Delivers**: Theme, colors, fonts, base atoms, Islamic decorative components

### Tasks

| # | Task | Details |
|---|------|---------|
| 0.1 | **Install fonts** | Inter, Noto Sans Bengali, Noto Naskh Arabic via `next/font/google` |
| 0.2 | **Configure theme tokens** | Override `globals.css` with Emerald+Gold palette (light & dark) |
| 0.3 | **Set up `next-themes`** | Wire `ThemeProvider` into root layout with system preference detection |
| 0.4 | **Create design tokens file** | `src/lib/design-tokens.ts` — exported color map, spacing, typography constants |
| 0.5 | **Create `IslamicPattern` component** | SVG geometric pattern (repeating 8-point star or arabesque) with configurable opacity, color, and size |
| 0.6 | **Create `ArchCard` component** | Card wrapper with subtle arch-shaped top decorative border in `--primary` |
| 0.7 | **Create `GeometricDivider` component** | SVG divider with Islamic geometric line pattern |
| 0.8 | **Create `StatusBadge` component** | Unified badge: `active` (green), `inactive` (gray), `pending` (amber), `overdue` (red), `paid` (emerald) |
| 0.9 | **Create `BismillahHeader` component** | Arabic calligraphy "بسم الله الرحمن الرحيم" for report headers |
| 0.10 | **Create `PageHeader` component** | Consistent page title + description + Bismillah (optional) + breadcrumb + action buttons |
| 0.11 | **Create `EmptyState` component** | Illustrated empty state with Islamic-themed illustration placeholder, title, description, CTA |
| 0.12 | **Create `LoadingSkeleton` patterns** | Skeleton loaders for: table rows, stat cards, form fields, chart areas |
| 0.13 | **Configure Framer Motion** | Shared animation variants: `fadeIn`, `slideUp`, `scaleIn`, `staggerChildren`, `pageTransition` |
| 0.14 | **Create `CrescentLogo` component** | SVG crescent moon + star logo in primary color, animated on load |

### Validation
- [ ] Theme renders correctly in light mode
- [ ] Theme renders correctly in dark mode
- [ ] All Islamic decorative components render
- [ ] Fonts load correctly (English, Bengali, Arabic)
- [ ] Animation variants work smoothly

---

## Phase 1 — Layout Shell & Navigation

**Goal**: Build the complete app shell — sidebar, header, mobile nav, breadcrumbs.  
**Duration**: ~1 session  
**Dependencies**: Phase 0  
**Delivers**: Full navigable app shell with all routes defined

### Tasks

| # | Task | Details |
|---|------|---------|
| 1.1 | **Create sidebar data config** | `src/config/navigation.ts` — full sidebar menu structure with icons, labels, paths, group headers |
| 1.2 | **Build `AppSidebar` component** | Using shadcn `Sidebar` — logo, navigation groups, collapsible sections, user avatar at bottom, tenant switcher (for SaaS) |
| 1.3 | **Build `AppHeader` component** | Top bar — breadcrumb, search (Command+K), notifications bell with badge, theme toggle, user dropdown |
| 1.4 | **Build `CommandPalette` component** | shadcn `Command` dialog — search across all pages, students, actions. Triggered by Ctrl+K |
| 1.5 | **Build `MobileNav` component** | Bottom tab bar with 5 main sections + "More" overflow menu (Sheet) |
| 1.6 | **Build `BreadcrumbNav` component** | Auto-generated breadcrumbs from route segments |
| 1.7 | **Build `NotificationDropdown` component** | Bell icon → dropdown with latest notifications, "Mark all read", "View all" link |
| 1.8 | **Build `UserMenu` component** | Avatar → dropdown with profile, settings, logout |
| 1.9 | **Build `TenantSwitcher` component** | Dropdown to switch between tenants (SaaS multi-tenant) — shows tenant logo + name |
| 1.10 | **Create `(dashboard)` route group** | `src/app/(dashboard)/layout.tsx` — wraps all authenticated pages with sidebar + header |
| 1.11 | **Create `(auth)` route group** | `src/app/(auth)/layout.tsx` — centered layout for login/register |
| 1.12 | **Wire middleware** | Redirect unauthenticated users to login, authenticated users away from auth pages |
| 1.13 | **Create placeholder pages** | Create all route directories with simple "Coming Soon" pages so navigation works end-to-end |

### Route Structure

```
src/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx              ← Sidebar + Header
│   ├── page.tsx                ← Dashboard (home)
│   ├── academic/
│   │   ├── students/page.tsx
│   │   ├── teachers/page.tsx
│   │   ├── employees/page.tsx
│   │   ├── classes/page.tsx
│   │   ├── sessions/page.tsx
│   │   └── promotions/page.tsx
│   ├── finance/
│   │   ├── fees/page.tsx
│   │   ├── fee-collections/page.tsx
│   │   ├── donations/page.tsx
│   │   ├── expenses/page.tsx
│   │   └── payroll/page.tsx
│   ├── inventory/
│   │   ├── products/page.tsx
│   │   ├── purchases/page.tsx
│   │   ├── stock/page.tsx
│   │   └── sales/page.tsx
│   ├── accounting/
│   │   ├── chart-of-accounts/page.tsx
│   │   └── journal-entries/page.tsx
│   ├── website/
│   │   ├── pages/page.tsx
│   │   ├── notices/page.tsx
│   │   └── gallery/page.tsx
│   └── system/
│       ├── users/page.tsx
│       ├── notifications/page.tsx
│       ├── activity-logs/page.tsx
│       └── settings/page.tsx
└── layout.tsx                  ← Root (fonts, themes, providers)
```

### Validation
- [ ] Sidebar renders with all navigation items
- [ ] Sidebar collapses on tablet (icon-only mode)
- [ ] Sidebar becomes sheet overlay on mobile
- [ ] Mobile bottom tab bar renders on small screens
- [ ] Command palette (Ctrl+K) works
- [ ] Theme toggle works (light ↔ dark)
- [ ] All placeholder pages are navigable
- [ ] Breadcrumbs auto-generate correctly

---

## Phase 2 — Authentication & Onboarding

**Goal**: Beautiful login/register flow with Islamic aesthetic.  
**Duration**: ~1 session  
**Dependencies**: Phase 0, Phase 1  
**Delivers**: Working auth UI connected to NextAuth

### Tasks

| # | Task | Details |
|---|------|---------|
| 2.1 | **Design login page** | Split layout: left side = Islamic geometric pattern background + branding, right side = login form. Mobile = full-screen form with pattern background |
| 2.2 | **Build `LoginForm` component** | Email + password fields with proper validation (react-hook-form + zod), "Remember me" checkbox, forgot password link, submit button with loading state |
| 2.3 | **Build `RegisterForm` component** | Multi-step: Step 1 (tenant info), Step 2 (admin user), Step 3 (subscription plan selection) |
| 2.4 | **Build `ForgotPasswordForm` component** | Email input → send reset link → success message |
| 2.5 | **Build `SubscriptionPlanCard` component** | Pricing card with plan features, green "Current" badge for selected, gold border for recommended |
| 2.6 | **Build `AuthPattern` component** | Animated Islamic geometric pattern for auth page backgrounds — slow rotation animation |
| 2.7 | **Connect to NextAuth** | Wire login/register forms to `/api/auth/[...nextauth]` |
| 2.8 | **Add error states** | Invalid credentials, network error, account locked — shown as toast + inline error |

### Validation
- [ ] Login form validates and submits
- [ ] Register multi-step form works
- [ ] Auth pages have Islamic pattern background
- [ ] Error states display correctly
- [ ] Redirect after login works
- [ ] Mobile auth layout is clean

---

## Phase 3 — Dashboard & Analytics

**Goal**: The heart of the app — a stunning dashboard with real-time stats, charts, and quick actions.  
**Duration**: ~1 session  
**Dependencies**: Phase 0, Phase 1, Phase 2  
**Delivers**: Full dashboard page with live data from `/api/dashboard`

### Tasks

| # | Task | Details |
|---|------|---------|
| 3.1 | **Build `StatCard` component** | Icon + label + value + trend (↑/↓ percentage) + sparkline. ArchCard variant for hero stats. Green for positive trends, red for negative |
| 3.2 | **Build `DashboardHero` section** | Welcome message with tenant name, current date (Hijri + Gregorian), quick action buttons (Add Student, Collect Fee, etc.) |
| 3.3 | **Build stat card grid** | 4 primary stats: Total Students, Fee Collection This Month, Pending Fees, Total Revenue. Responsive: 2x2 on mobile, 4 across on desktop |
| 3.4 | **Build `FeeCollectionChart`** | Area chart — monthly fee collection trend (Recharts). Emerald fill, gold accent line |
| 5.5 | **Build `StudentDistributionChart`** | Donut chart — students by class/section. Emerald/gold/sky palette |
| 3.6 | **Build `PaymentStatusChart`** | Stacked bar chart — paid vs unpaid vs partially paid by month |
| 3.7 | **Build `RecentActivity` component** | Timeline list of recent activities with icon, description, timestamp. Max 10 items with "View All" |
| 3.8 | **Build `UpcomingEvents` component** | Card list: due fees, pending salary, low stock alerts — with countdown/due date |
| 3.9 | **Build `QuickActions` component** | Grid of quick action buttons: "Admit Student", "Collect Fee", "Add Expense", "Pay Salary" — with icons |
| 3.10 | **Build `DashboardOverview` chart** | Composite: revenue vs expenses line chart for the academic session |
| 3.11 | **Connect to API** | Fetch all dashboard data from `/api/dashboard`, show skeletons while loading, handle errors |
| 3.12 | **Add date range filter** | Global date range selector (this month, this quarter, this session, custom) that filters all dashboard data |

### Dashboard Layout (Desktop)
```
┌─────────────────────────────────────────────────┐
│  Welcome, Al-Huda Academy!   📅 Aug 5, 2025    │
│  ─────────────────────────────────────────────  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ 1250 │  │৳4.2L │  │৳85K  │  │ 92%  │       │
│  │Studnt│  │Collec│  │Pendng│  │ Paid │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│  ─────────────────────────────────────────────  │
│  ┌─── Fee Collection Trend ───┐  ┌── Quick ──┐ │
│  │  📈 Area Chart             │  │  Actions   │ │
│  │                            │  │            │ │
│  └────────────────────────────┘  └────────────┘ │
│  ┌─── Payment Status ────────┐  ┌── Recent ──┐ │
│  │  📊 Stacked Bar           │  │  Activity   │ │
│  │                            │  │            │ │
│  └────────────────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────┘
```

### Validation
- [ ] All stat cards render with data
- [ ] Charts render with sample data
- [ ] Quick actions navigate to correct pages
- [ ] Recent activity timeline renders
- [ ] Dashboard is responsive (mobile card layout works)
- [ ] Skeleton loaders show during data fetch
- [ ] Date range filter updates all widgets

---

## Phase 4 — Academic Management

**Goal**: Complete CRUD for students, teachers, employees, classes, sessions.  
**Duration**: ~2 sessions  
**Dependencies**: Phase 0-3  
**Delivers**: All academic module pages

### 4A — Students Module

| # | Task | Details |
|---|------|---------|
| 4A.1 | **Build `StudentDataTable`** | TanStack Table — columns: photo, name (En+Bn), class, section, roll, status, actions. Searchable, sortable, filterable, paginated |
| 4A.2 | **Build `StudentProfileCard`** | Avatar + name + class + status badge — used in table rows and lists |
| 4A.3 | **Build `StudentForm`** | Multi-step: Personal → Academic → Guardian → Documents. React-hook-form + zod validation. Photo upload with crop |
| 4A.4 | **Build `StudentDetailPage`** | Tab layout: Overview, Academic, Fees, Guardians, Documents. Profile header with photo + key info |
| 4A.5 | **Build `StudentFilters`** | Filter bar: class, section, status, gender, academic session. Saved filter presets |
| 4A.6 | **Build `StudentIDCard`** | Printable student ID card with photo, name, class, roll — Islamic decorative border |
| 4A.7 | **Build `BulkAdmission`** | Upload CSV → preview → validate → import students in bulk |

### 4B — Teachers Module

| # | Task | Details |
|---|------|---------|
| 4B.1 | **Build `TeacherDataTable`** | Similar to student table — columns: photo, name, employee ID, phone, qualification, status |
| 4B.2 | **Build `TeacherForm`** | Personal info + professional details + salary info |
| 4B.3 | **Build `TeacherDetailPage`** | Tabs: Overview, Classes (assigned), Salary, Documents |

### 4C — Employees Module

| # | Task | Details |
|---|------|---------|
| 4C.1 | **Build `EmployeeDataTable`** | Table with department, designation filters |
| 4C.2 | **Build `EmployeeForm`** | Personal + employment details |
| 4C.3 | **Build `EmployeeDetailPage`** | Overview, Salary, Documents tabs |

### 4D — Classes & Sections

| # | Task | Details |
|---|------|---------|
| 4D.1 | **Build `ClassManager`** | Card grid of classes — each card shows class name, code, sections, student count, teacher. Click to expand sections |
| 4D.2 | **Build `ClassForm`** | Name, code, capacity, assign teacher, academic session |
| 4D.3 | **Build `SectionForm`** | Name, capacity, assign section in-charge teacher |
| 4D.4 | **Build `ClassDetailView`** | Students list, sections, fee structures — all in one view |

### 4E — Academic Sessions & Promotions

| # | Task | Details |
|---|------|---------|
| 4E.1 | **Build `SessionManager`** | Timeline view of academic sessions — current session highlighted in green |
| 4E.2 | **Build `SessionForm`** | Name, start date, end date, status |
| 4E.3 | **Build `PromotionWizard`** | Multi-step: Select session → Select from class → Select students → Choose to class/section → Confirm |

### Shared Components (built in Phase 4)

| Component | Description |
|-----------|-------------|
| `PersonForm` | Base form for student/teacher/employee shared fields |
| `PhotoUpload` | Avatar upload with crop, preview, and default avatar |
| `AddressFields` | Reusable address block (address, city, state, country, postal code) |
| `DataTable` | Generic TanStack Table wrapper with search, sort, filter, pagination, export |
| `FormWizard` | Multi-step form with progress indicator and validation per step |
| `DetailPageLayout` | Tabbed detail page with profile header |
| `ExportButton` | CSV/PDF export trigger for any data table |
| `PrintLayout` | Print-optimized layout with Bismillah header, institution info, decorative border |

### Validation
- [ ] All CRUD operations work for each entity
- [ ] Data tables are searchable, sortable, paginated
- [ ] Forms validate properly (inline errors)
- [ ] Mobile: tables switch to card list view
- [ ] Photo upload works
- [ ] Student ID card prints correctly
- [ ] Promotion wizard works end-to-end

---

## Phase 5 — Finance & Fee Management

**Goal**: Complete fee management, collection, donations, expenses.  
**Duration**: ~2 sessions  
**Dependencies**: Phase 0-4  
**Delivers**: All finance module pages

### 5A — Fee Management

| # | Task | Details |
|---|------|---------|
| 5A.1 | **Build `FeeCategoryManager`** | List of fee categories with amount, recurring info. Inline edit |
| 5A.2 | **Build `FeeStructureBuilder`** | Matrix view: Classes (rows) × Fee Categories (columns) = Amount. Editable cells. Academic session selector |
| 5A.3 | **Build `FeeInvoiceList`** | Table: invoice #, student, total, paid, balance, status, due date. Color-coded status (paid=green, partial=amber, overdue=red) |
| 5A.4 | **Build `FeeInvoiceDetail`** | Invoice view: student info, line items, totals, payment history. Print button → formatted invoice with Islamic border |
| 5A.5 | **Build `GenerateInvoiceWizard`** | Multi-step: Select session/class → Select students → Review fee structure → Generate invoices |
| 5A.6 | **Build `FeeInvoicePrint`** | Print-optimized invoice: Bismillah header, institution info, student details, fee breakdown, total, received stamp area |

### 5B — Fee Collection (Payments)

| # | Task | Details |
|---|------|---------|
| 5B.1 | **Build `CollectPaymentForm`** | Search student → show outstanding invoices → select invoice → enter amount → payment method → collect. Receipt generated |
| 5B.2 | **Build `PaymentReceipt`** | Print-optimized receipt: Bismillah, institution, student, payment details, received by, stamp area |
| 5B.3 | **Build `CollectionReport`** | Daily/monthly collection summary with breakdown by payment method |
| 5B.4 | **Build `FeeDiscountForm`** | Apply discount to student invoice — type (percentage/flat), reason, approval |

### 5C — Donations

| # | Task | Details |
|---|------|---------|
| 5C.1 | **Build `DonationDashboard`** | Stats: total donations this month, top donors, by category. Chart: donation trend |
| 5C.2 | **Build `DonorList`** | Table with search, filters (category, date range) |
| 5C.3 | **Build `DonationForm`** | Donor search/create + amount + category + date + receipt |

### 5D — Expenses

| # | Task | Details |
|---|------|---------|
| 5D.1 | **Build `ExpenseDashboard`** | Stats: this month total, by category breakdown (pie chart), budget vs actual |
| 5D.2 | **Build `ExpenseList`** | Table with category, amount, date, description, receipt attachment |
| 5D.3 | **Build `ExpenseForm`** | Category, amount, date, description, receipt upload |

### Validation
- [ ] Fee structure matrix builder works
- [ ] Invoice generation creates correct invoices
- [ ] Payment collection updates invoice status
- [ ] Receipt prints correctly with Islamic design
- [ ] Discount application works
- [ ] Donation and expense CRUD work
- [ ] All financial figures show in Bengali Taka (৳) format

---

## Phase 6 — HR & Payroll

**Goal**: Salary structure management and payroll processing.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-5  
**Delivers**: Payroll module pages

### Tasks

| # | Task | Details |
|---|------|---------|
| 6.1 | **Build `SalaryStructureList`** | Table: employee/teacher name, basic, total salary, net salary. Filter by type (teacher/employee) |
| 6.2 | **Build `SalaryStructureForm`** | Employee selector + basic salary + allowances (house rent, medical, transport, other) + deductions (PF, tax, other) → auto-calculate total/net |
| 6.3 | **Build `PayrollProcessor`** | Select month → Show all employees with salary → Mark absent days/deductions → Generate salary payments |
| 6.4 | **Build `PayslipView`** | Detailed payslip: Bismillah header, institution info, employee info, earnings breakdown, deductions breakdown, net pay. Print-optimized |
| 6.5 | **Build `PayrollDashboard`** | Stats: total payroll this month, paid vs pending, department breakdown. Chart: payroll trend |
| 6.6 | **Build `SalaryPaymentList`** | Table: employee, month, gross, deductions, net, status (paid/pending), payment date |

### Validation
- [ ] Salary structure CRUD works
- [ ] Auto-calculation of total/net salary is correct
- [ ] Payroll processing generates payments
- [ ] Payslip prints correctly
- [ ] Payroll dashboard shows accurate stats

---

## Phase 7 — Inventory & Procurement

**Goal**: Product management, purchasing, stock tracking, and sales.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-6  
**Delivers**: Inventory module pages

### Tasks

| # | Task | Details |
|---|------|---------|
| 7.1 | **Build `ProductList`** | Table/grid toggle: name, category, SKU, purchase price, sale price, stock, status. Low stock highlighted in red |
| 7.2 | **Build `ProductForm`** | Name, category, SKU, prices, stock, min/max levels, unit, description |
| 7.3 | **Build `PurchaseOrderList`** | Table: PO #, supplier, date, total, status (draft/ordered/received) |
| 7.4 | **Build `PurchaseOrderForm`** | Supplier selector + line items (product, qty, price) → auto-total. Status workflow |
| 7.5 | **Build `StockDashboard`** | Stock value, low stock alerts, recent movements. Chart: stock levels by category |
| 7.6 | **Build `StockMovementLog`** | Timeline of stock in/out with reason, quantity, reference |
| 7.7 | **Build `SalesList`** | Table: invoice #, date, items, total, status |
| 7.8 | **Build `SalesForm`** | Customer info + line items → auto-total → create invoice |

### Validation
- [ ] Product CRUD works with category filter
- [ ] Purchase order workflow (draft → ordered → received) works
- [ ] Stock updates on purchase receive / sales
- [ ] Low stock alerts show correctly
- [ ] Sales invoice generation works

---

## Phase 8 — Accounting & Reports

**Goal**: Double-entry accounting, chart of accounts, journal entries, financial reports.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-7  
**Delivers**: Accounting module pages

### Tasks

| # | Task | Details |
|---|------|---------|
| 8.1 | **Build `ChartOfAccountsTree`** | Hierarchical tree view: Assets, Liabilities, Income, Expenses, Equity — expandable with account codes |
| 8.2 | **Build `AccountForm`** | Code, name, type, parent account, opening balance |
| 8.3 | **Build `JournalEntryList`** | Table: entry #, date, description, total debit/credit, status |
| 8.4 | **Build `JournalEntryForm`** | Date + description + line items (account, debit, credit) → must balance (total debit = total credit) |
| 8.5 | **Build `LedgerView`** | Account ledger: all transactions for selected account with running balance |
| 8.6 | **Build `TrialBalance`** | Report: all accounts with debit/credit totals → must balance |
| 8.7 | **Build `IncomeStatement`** | Revenue - Expenses = Net Income. Monthly/yearly comparison |
| 8.8 | **Build `BalanceSheet`** | Assets = Liabilities + Equity. As-of-date snapshot |
| 8.9 | **Build `FinancialReportShell`** | Print layout wrapper: Bismillah, institution info, report title, date range, decorative Islamic border, page numbers |

### Validation
- [ ] Chart of accounts tree renders and navigates
- [ ] Journal entries must balance before save
- [ ] Ledger view shows correct running balance
- [ ] Trial balance totals match
- [ ] Financial reports print correctly
- [ ] Bismillah + Islamic border on all print layouts

---

## Phase 9 — CMS & Communication

**Goal**: Website content, notices, gallery management.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-8  
**Delivers**: CMS module pages

### Tasks

| # | Task | Details |
|---|------|---------|
| 9.1 | **Build `PageEditor`** | MDXEditor-powered rich text editor for website pages — title, slug, content, SEO meta, publish/draft |
| 9.2 | **Build `PageList`** | Table: title, slug, status (published/draft), last updated |
| 9.3 | **Build `NoticeBoard`** | Card list of notices with date, priority badge (urgent=red, normal=green), audience (public/staff/students) |
| 9.4 | **Build `NoticeForm`** | Title, content (rich text), date, priority, audience, attachment |
| 9.5 | **Build `GalleryManager`** | Grid of gallery albums — each with cover image, title, image count. Click to manage images |
| 9.6 | **Build `ImageUploader`** | Drag & drop image upload with preview, reorder, caption. Optimized with Sharp |

### Validation
- [ ] MDX editor works with rich content
- [ ] Pages can be published/drafted
- [ ] Notice board displays with priority badges
- [ ] Gallery upload and management works
- [ ] Image optimization works

---

## Phase 10 — System & Administration

**Goal**: User management, RBAC, notifications, activity logs, settings.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-9  
**Delivers**: System admin pages

### Tasks

| # | Task | Details |
|---|------|---------|
| 10.1 | **Build `UserManagement`** | Table: name, email, role, status, last login. Actions: edit, deactivate, reset password |
| 10.2 | **Build `UserForm`** | Personal info + role assignment (multi-select) + tenant assignment |
| 10.3 | **Build `RoleManager`** | Card grid of roles — click to edit permissions. System roles locked (badge: "System") |
| 10.4 | **Build `PermissionMatrix`** | Matrix: Roles (rows) × Permissions (columns) — toggle checkboxes. Grouped by module |
| 10.5 | **Build `NotificationCenter`** | Full-page notification list with filters (type, read/unread, date). Mark as read, bulk actions |
| 10.6 | **Build `ActivityLogViewer`** | Filterable timeline: user, action, entity, timestamp, IP address. Search and date range filter |
| 10.7 | **Build `AuditLogViewer`** | Read-only log with old/new values diff view (JSON diff highlighted) |
| 10.8 | **Build `SettingsPage`** | Grouped settings: General (institution info, logo), Academic (defaults), Finance (currency, fiscal year), Appearance (theme, branding), Notifications (email/SMS config) |
| 10.9 | **Build `InstitutionProfile`** | Edit institution name, logo, address, contact — with live preview of how it appears on print layouts |

### Validation
- [ ] User CRUD with role assignment works
- [ ] Permission matrix toggles save correctly
- [ ] Notification center filters work
- [ ] Activity and audit logs display
- [ ] Settings save and apply
- [ ] Institution profile updates reflect in print layouts

---

## Phase 11 — Polish, Animations & Micro-Interactions

**Goal**: Elevate the entire app to premium quality with animations, transitions, and micro-interactions.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-10  
**Delivers**: Production-ready polish

### Tasks

| # | Task | Details |
|---|------|---------|
| 11.1 | **Page transitions** | Framer Motion `AnimatePresence` for route changes — subtle fade+slide |
| 11.2 | **Card hover effects** | Subtle lift (translate-y -2px) + shadow increase on hover for all interactive cards |
| 11.3 | **Button micro-interactions** | Scale-down on press (0.98), ripple effect on click for primary buttons |
| 11.4 | **Table row interactions** | Highlight on hover, slide-in animation for new rows, fade-out for deleted rows |
| 11.5 | **Stat card animations** | Count-up animation for numbers on dashboard load |
| 11.6 | **Form field focus** | Subtle border color transition + label float animation on focus |
| 11.7 | **Loading states** | Skeleton → fade → content transition. No layout shifts |
| 11.8 | **Success animations** | Checkmark animation after successful form submit, payment collection, etc. |
| 11.9 | **Sidebar transition** | Smooth width transition when collapsing/expanding sidebar |
| 11.10 | **Mobile gestures** | Swipe-to-delete on list items, pull-to-refresh on data pages |
| 11.11 | **Islamic pattern animation** | Subtle slow rotation/drift of Islamic pattern on auth pages and dashboard hero |
| 11.12 | **Empty state animations** | Gentle floating animation on empty state illustrations |
| 11.13 | **Notification badge** | Pulse animation on unread notification badge |
| 11.14 | **Chart animations** | Animated chart entry — bars grow up, lines draw in, donuts spin in |

### Validation
- [ ] All animations are smooth (60fps)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] No layout shifts during loading
- [ ] Mobile gestures work on touch devices
- [ ] App feels premium and polished

---

## Phase 12 — Accessibility & Final QA

**Goal**: Ensure the app is accessible, performant, and production-ready.  
**Duration**: ~1 session  
**Dependencies**: Phase 0-11  
**Delivers**: Production-ready application

### Tasks

| # | Task | Details |
|---|------|---------|
| 12.1 | **Keyboard navigation** | All interactive elements reachable via Tab, operable via Enter/Space. Skip-to-content link |
| 12.2 | **Screen reader support** | Proper ARIA labels, live regions for dynamic updates, alt text for all images |
| 12.3 | **Color contrast audit** | All text meets WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text) |
| 12.4 | **Focus indicators** | Visible focus rings on all interactive elements — emerald color ring |
| 12.5 | **Error boundaries** | React error boundaries with friendly error UI (not crash) |
| 12.6 | **Performance optimization** | Lazy load charts, virtualize long lists, optimize images, code split by route |
| 12.7 | **Print stylesheets** | Clean print CSS for all report pages — hide navigation, show Bismillah header |
| 12.8 | **Bengali/Arabic text support** | Proper font rendering, no broken glyphs, RTL support for Arabic content |
| 12.9 | **Cross-browser testing** | Chrome, Firefox, Safari, Edge — verify layout consistency |
| 12.10 | **Mobile device testing** | Test on actual mobile viewport — touch targets ≥44px, no horizontal scroll |

### Validation
- [ ] Keyboard-only navigation works for all flows
- [ ] Screen reader announces all content correctly
- [ ] Color contrast passes WCAG AA
- [ ] No console errors in production build
- [ ] Print layouts are clean
- [ ] Bengali and Arabic text renders correctly

---

## 📊 Phase Summary

| Phase | Name | Sessions | Key Deliverable |
|-------|------|----------|-----------------|
| **0** | Design System Foundation | 1 | Theme, colors, fonts, Islamic components |
| **1** | Layout Shell & Navigation | 1 | Sidebar, header, mobile nav, all routes |
| **2** | Authentication & Onboarding | 1 | Login, register, subscription selection |
| **3** | Dashboard & Analytics | 1 | Live dashboard with charts & stats |
| **4** | Academic Management | 2 | Students, teachers, employees, classes CRUD |
| **5** | Finance & Fee Management | 2 | Fee structure, invoices, collections, receipts |
| **6** | HR & Payroll | 1 | Salary structures, payroll, payslips |
| **7** | Inventory & Procurement | 1 | Products, purchases, stock, sales |
| **8** | Accounting & Reports | 1 | Chart of accounts, journal entries, financial reports |
| **9** | CMS & Communication | 1 | Website pages, notices, gallery |
| **10** | System & Administration | 1 | Users, roles, permissions, settings |
| **11** | Polish & Animations | 1 | Micro-interactions, transitions, premium feel |
| **12** | Accessibility & QA | 1 | A11y, performance, cross-browser, final polish |
| | **TOTAL** | **~14 sessions** | **Complete ERP** |

---

## 🏁 Success Criteria

When all phases are complete, the Madrasha ERP will:

1. ✅ **Feel Islamic** — Emerald green, gold accents, geometric patterns, Bismillah on reports
2. ✅ **Feel Premium** — Smooth animations, generous whitespace, consistent design language
3. ✅ **Work on Mobile** — Every feature accessible on phone, bottom tab nav, sheet forms
4. ✅ **Be Productive** — Command palette, quick actions, keyboard shortcuts, smart defaults
5. ✅ **Be Accessible** — Keyboard nav, screen readers, WCAG AA contrast, Bengali/Arabic support
6. ✅ **Print Beautifully** — Bismillah header, Islamic borders, institution branding on all reports
7. ✅ **Scale as SaaS** — Multi-tenant, role-based access, subscription plans
8. ✅ **Be Maintainable** — Clean component architecture, documented, AI-friendly code

---

*بسم الله الرحمن الرحيم*  
*In the name of Allah, the Most Gracious, the Most Merciful*  
*Let us build something beautiful. 🕌*
