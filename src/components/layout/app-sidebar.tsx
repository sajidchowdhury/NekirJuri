'use client'

// ============================================================
// AppSidebar — Main application sidebar with navigation
// Uses shadcn Sidebar components with Islamic Modern Premium theme
// ============================================================

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import CrescentLogo from '@/components/islamic/crescent-logo'
import { navigation } from '@/config/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r-border" role="navigation" aria-label="Main navigation">
      {/* ── Header: Logo + Tenant ── */}
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <CrescentLogo size="sm" animated={false} />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Madrasha ERP
            </span>
            <span className="text-xs text-muted-foreground">
              Al-Huda Academy
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Content: Navigation Groups ── */}
      <SidebarContent className="px-2">
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider" role="heading" aria-level={2}>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon = item.icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium [&_svg]:text-emerald-700 dark:[&_svg]:text-emerald-400'
                            : 'hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:bg-emerald-900/10 dark:hover:text-emerald-400'
                        }
                      >
                        <Link href={item.href}>
                          <Icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge className="bg-emerald-600 text-white dark:bg-emerald-500 text-[10px]">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer: User Info ── */}
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="size-8">
            <AvatarFallback className="bg-emerald-700 text-white text-xs font-medium dark:bg-emerald-600">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 items-center justify-between group-data-[collapsible=icon]:hidden">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Sajid Admin</span>
              <span className="text-xs text-muted-foreground">Super Admin</span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
