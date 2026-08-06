import {
  LayoutDashboard, GraduationCap, Users, UserCog, School, Calendar, ArrowUpRight,
  Receipt, Banknote, HandHeart, ReceiptText, CreditCard,
  Package, ShoppingCart, BarChart3, ShoppingBag,
  BookOpen, FileText,
  Globe, FileSpreadsheet, Megaphone, ImageIcon,
  Settings, Shield, Bell, Activity, Wrench
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Academic',
    items: [
      { title: 'Students', href: '/academic/students', icon: GraduationCap },
      { title: 'Teachers', href: '/academic/teachers', icon: UserCog },
      { title: 'Employees', href: '/academic/employees', icon: Users },
      { title: 'Classes', href: '/academic/classes', icon: School },
      { title: 'Sessions', href: '/academic/sessions', icon: Calendar },
      { title: 'Promotions', href: '/academic/promotions', icon: ArrowUpRight },
    ],
  },
  {
    title: 'Finance',
    items: [
      { title: 'Fee Management', href: '/finance/fees', icon: Receipt },
      { title: 'Collections', href: '/finance/collections', icon: Banknote },
      { title: 'Donations', href: '/finance/donations', icon: HandHeart },
      { title: 'Expenses', href: '/finance/expenses', icon: ReceiptText },
      { title: 'Payroll', href: '/finance/payroll', icon: CreditCard },
    ],
  },
  {
    title: 'Inventory',
    items: [
      { title: 'Products', href: '/inventory/products', icon: Package },
      { title: 'Purchases', href: '/inventory/purchases', icon: ShoppingCart },
      { title: 'Stock', href: '/inventory/stock', icon: BarChart3 },
      { title: 'Sales', href: '/inventory/sales', icon: ShoppingBag },
    ],
  },
  {
    title: 'Accounting',
    items: [
      { title: 'Chart of Accounts', href: '/accounting/chart-of-accounts', icon: BookOpen },
      { title: 'Journal Entries', href: '/accounting/journal-entries', icon: FileText },
    ],
  },
  {
    title: 'Website',
    items: [
      { title: 'Pages', href: '/website/pages', icon: FileSpreadsheet },
      { title: 'Notices', href: '/website/notices', icon: Megaphone },
      { title: 'Gallery', href: '/website/gallery', icon: ImageIcon },
    ],
  },
  {
    title: 'System',
    items: [
      { title: 'Users & Roles', href: '/system/users', icon: Shield },
      { title: 'Notifications', href: '/system/notifications', icon: Bell, badge: '3' },
      { title: 'Activity Log', href: '/system/activity-logs', icon: Activity },
      { title: 'Settings', href: '/system/settings', icon: Wrench },
    ],
  },
]

// Mobile bottom tabs (5 main + overflow)
export const mobileTabs: NavItem[] = [
  { title: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Academic', href: '/academic/students', icon: GraduationCap },
  { title: 'Finance', href: '/finance/fees', icon: Receipt },
  { title: 'Inventory', href: '/inventory/products', icon: Package },
  { title: 'More', href: '/more', icon: Settings },
]
