'use client'

// ============================================================
// AppHeader — Top header bar with sidebar trigger, breadcrumbs,
// Bismillah (subtle, centered), search, notifications, theme toggle,
// language switcher, and user menu
// CR-1: Bismillah shown in top bar only, not on individual pages
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { CommandPalette } from '@/components/layout/command-palette'
import { NotificationDropdown } from '@/components/layout/notification-dropdown'
import { UserMenu } from '@/components/layout/user-menu'
import { LanguageSwitcher } from '@/components/layout/language-switcher'

/** Breadcrumb segment key mapping to translation keys */
const segmentKeys: Record<string, string> = {
  dashboard: 'dashboard',
  academic: 'academic',
  finance: 'finance',
  inventory: 'inventory',
  accounting: 'accounting',
  website: 'website',
  system: 'system',
  students: 'students',
  teachers: 'teachers',
  employees: 'employees',
  classes: 'classes',
  sessions: 'sessions',
  promotions: 'promotions',
  fees: 'fees',
  collections: 'collections',
  donations: 'donations',
  expenses: 'expenses',
  payroll: 'payroll',
  products: 'products',
  purchases: 'purchases',
  stock: 'stock',
  sales: 'sales',
  'chart-of-accounts': 'chartOfAccounts',
  'journal-entries': 'journalEntries',
  pages: 'pages',
  notices: 'notices',
  gallery: 'gallery',
  users: 'users',
  notifications: 'notifications',
  'activity-logs': 'activityLogs',
  settings: 'settings',
  billing: 'billing',
}

export function AppHeader() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const t = useTranslations('breadcrumbs')
  const tHeader = useTranslations('header')

  // Build breadcrumb segments from pathname
  const segments = pathname
    .split('/')
    .filter(Boolean)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4" role="banner">
      {/* Left: Sidebar trigger + Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="shrink-0" />
        <Separator orientation="vertical" className="h-6 shrink-0" />

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const href = '/' + segments.slice(0, index + 1).join('/')
              const isLast = index === segments.length - 1
              const key = segmentKeys[segment]
              const label = key ? t(key) : segment.charAt(0).toUpperCase() + segment.slice(1)

              return (
                <BreadcrumbItem key={href}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={href}>{label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Center: Bismillah — subtle, only visible on desktop */}
      <p
        className="hidden lg:flex text-arabic text-emerald-600/60 dark:text-emerald-400/50 text-sm font-medium leading-none select-none"
        dir="rtl"
        lang="ar"
        aria-label="Bismillah"
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>

      {/* Right: Search + Language + Notifications + Theme + User */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search trigger */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex h-8 gap-2 text-muted-foreground border-border hover:border-emerald-300 dark:hover:border-emerald-700"
          onClick={() => {
            // Trigger command palette via custom event
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }}
          aria-label="Search"
        >
          <Search className="size-3.5" />
          <span className="text-xs">{tHeader('search')}</span>
          <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-muted-foreground"
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
          }}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <LanguageSwitcher />
        <NotificationDropdown />
        <ThemeToggle />
        <UserMenu />
      </div>

      <CommandPalette />
    </header>
  )
}

export default AppHeader
