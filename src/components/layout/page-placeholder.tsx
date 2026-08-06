'use client'

// ============================================================
// PagePlaceholder — Placeholder for unimplemented pages
// Shows PageHeader + EmptyState + phase notice
// Uses string icon key to avoid passing functions from server components
// ============================================================

import {
  LayoutDashboard, GraduationCap, Users, UserCog, School, Calendar, ArrowUpRight,
  Receipt, Banknote, HandHeart, ReceiptText, CreditCard,
  Package, ShoppingCart, BarChart3, ShoppingBag,
  BookOpen, FileText,
  FileSpreadsheet, Megaphone, ImageIcon,
  Shield, Bell, Activity, Wrench,
  type LucideIcon,
} from 'lucide-react'
import PageHeader from '@/components/atoms/page-header'
import EmptyState from '@/components/atoms/empty-state'

/** Map of icon keys to Lucide icon components */
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCog,
  School,
  Calendar,
  ArrowUpRight,
  Receipt,
  Banknote,
  HandHeart,
  ReceiptText,
  CreditCard,
  Package,
  ShoppingCart,
  BarChart3,
  ShoppingBag,
  BookOpen,
  FileText,
  FileSpreadsheet,
  Megaphone,
  ImageIcon,
  Shield,
  Bell,
  Activity,
  Wrench,
}

export interface PagePlaceholderProps {
  title: string
  description: string
  /** Icon key matching a Lucide icon name (e.g. 'GraduationCap') */
  iconKey: string
}

export default function PagePlaceholder({ title, description, iconKey }: PagePlaceholderProps) {
  const Icon = iconMap[iconKey] ?? LayoutDashboard

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
      />

      <EmptyState
        title={`${title} — Coming Soon`}
        description="This module will be implemented in an upcoming phase. Stay tuned for updates!"
        icon={<Icon className="size-10 text-emerald-600 dark:text-emerald-400" />}
      />
    </div>
  )
}
