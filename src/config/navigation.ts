// ============================================================
// Navigation Configuration — CR-2: i18n-aware
// Navigation items use translation keys instead of hardcoded strings.
// Components that render navigation should use useTranslations('nav')
// to resolve the display title from the key.
// ============================================================

import {
  LayoutDashboard, GraduationCap, Users, UserCog, School, Calendar, ArrowUpRight,
  Receipt, Banknote, HandHeart, ReceiptText, CreditCard,
  Package, ShoppingCart, BarChart3, ShoppingBag,
  BookOpen, FileText,
  Globe, FileSpreadsheet, Megaphone, ImageIcon,
  Settings, Shield, Bell, Activity, Wrench, HardDrive
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  /** Translation key in the 'nav' namespace */
  titleKey: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  /** Translation key in the 'nav' namespace */
  titleKey: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    titleKey: 'overview',
    items: [
      { titleKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    titleKey: 'academic',
    items: [
      { titleKey: 'students', href: '/academic/students', icon: GraduationCap },
      { titleKey: 'teachers', href: '/academic/teachers', icon: UserCog },
      { titleKey: 'employees', href: '/academic/employees', icon: Users },
      { titleKey: 'classes', href: '/academic/classes', icon: School },
      { titleKey: 'sessions', href: '/academic/sessions', icon: Calendar },
      { titleKey: 'promotions', href: '/academic/promotions', icon: ArrowUpRight },
    ],
  },
  {
    titleKey: 'finance',
    items: [
      { titleKey: 'feeManagement', href: '/finance/fees', icon: Receipt },
      { titleKey: 'collections', href: '/finance/collections', icon: Banknote },
      { titleKey: 'donations', href: '/finance/donations', icon: HandHeart },
      { titleKey: 'expenses', href: '/finance/expenses', icon: ReceiptText },
      { titleKey: 'payroll', href: '/finance/payroll', icon: CreditCard },
    ],
  },
  {
    titleKey: 'inventory',
    items: [
      { titleKey: 'products', href: '/inventory/products', icon: Package },
      { titleKey: 'purchases', href: '/inventory/purchases', icon: ShoppingCart },
      { titleKey: 'stock', href: '/inventory/stock', icon: BarChart3 },
      { titleKey: 'sales', href: '/inventory/sales', icon: ShoppingBag },
    ],
  },
  {
    titleKey: 'accounting',
    items: [
      { titleKey: 'chartOfAccounts', href: '/accounting/chart-of-accounts', icon: BookOpen },
      { titleKey: 'journalEntries', href: '/accounting/journal-entries', icon: FileText },
    ],
  },
  {
    titleKey: 'website',
    items: [
      { titleKey: 'pages', href: '/website/pages', icon: FileSpreadsheet },
      { titleKey: 'notices', href: '/website/notices', icon: Megaphone },
      { titleKey: 'gallery', href: '/website/gallery', icon: ImageIcon },
    ],
  },
  {
    titleKey: 'system',
    items: [
      { titleKey: 'usersRoles', href: '/system/users', icon: Shield },
      { titleKey: 'notifications', href: '/system/notifications', icon: Bell, badge: '3' },
      { titleKey: 'activityLog', href: '/system/activity-logs', icon: Activity },
      { titleKey: 'billing', href: '/system/billing', icon: CreditCard },
      { titleKey: 'backupRestore', href: '/system/backup', icon: HardDrive },
      { titleKey: 'settings', href: '/system/settings', icon: Wrench },
    ],
  },
]

// Mobile bottom tabs (5 main + overflow)
export const mobileTabs: NavItem[] = [
  { titleKey: 'home', href: '/dashboard', icon: LayoutDashboard },
  { titleKey: 'academic', href: '/academic/students', icon: GraduationCap },
  { titleKey: 'finance', href: '/finance/fees', icon: Receipt },
  { titleKey: 'inventory', href: '/inventory/products', icon: Package },
  { titleKey: 'more', href: '/more', icon: Settings },
]
