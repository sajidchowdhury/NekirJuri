'use client'

// ============================================================
// AppSidebar — Main application sidebar with navigation
// CR-2: Multi-Language System — All strings use useTranslations
// CR-9: Accordion behavior — click group expands it, collapses others.
// Active group auto-expanded. Chevron indicator with rotation.
// Uses shadcn Sidebar + Collapsible components with Islamic Modern Premium theme
// ============================================================

import { useState, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

/**
 * Custom hook for accordion sidebar state.
 * Returns the expanded group titleKey based on:
 *  1. The active group (containing current route) — auto-expanded on navigation
 *  2. Manual toggle by the user — overrides auto-expansion until next navigation
 *
 * This avoids useEffect by using a version counter tied to pathname changes.
 */
function useAccordionGroups() {
  const pathname = usePathname()

  // Determine which group contains the active route
  const activeGroupKey = useMemo(() => {
    for (const group of navigation) {
      for (const item of group.items) {
        if (pathname === item.href || pathname.startsWith(item.href + '/')) {
          return group.titleKey
        }
      }
    }
    return navigation[0]?.titleKey ?? null
  }, [pathname])

  // Track manual overrides per "navigation version" (pathname change).
  const [override, setOverride] = useState<{ version: number; group: string | null | undefined }>({
    version: 0,
    group: undefined,
  })

  const [lastPathname, setLastPathname] = useState(pathname)
  const version = override.version

  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOverride({ version: version + 1, group: undefined })
  }

  const currentVersion = pathname !== lastPathname ? version + 1 : version
  const expandedGroup =
    override.version === currentVersion && override.group !== undefined
      ? override.group
      : activeGroupKey

  const handleGroupToggle = useCallback(
    (groupKey: string, currentVersion: number, isCurrentlyExpanded: boolean) => {
      setOverride({
        version: currentVersion,
        group: isCurrentlyExpanded ? null : groupKey,
      })
    },
    []
  )

  return { expandedGroup, handleGroupToggle, version, activeGroupKey }
}

export function AppSidebar() {
  const { expandedGroup, handleGroupToggle, version, activeGroupKey } = useAccordionGroups()
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tApp = useTranslations('app')
  const tSidebar = useTranslations('sidebar')

  return (
    <Sidebar collapsible="icon" className="border-r-border" role="navigation" aria-label="Main navigation">
      {/* ── Header: Logo + Tenant ── */}
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <CrescentLogo size="sm" animated={false} />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              {tApp('name')}
            </span>
            <span className="text-xs text-muted-foreground">
              Al-Huda Academy
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── Content: Navigation Groups with Accordion Behavior ── */}
      <SidebarContent className="px-2">
        {navigation.map((group) => {
          const isExpanded = expandedGroup === group.titleKey
          const isActiveGroup = activeGroupKey === group.titleKey
          const groupTitle = t(group.titleKey)

          return (
            <SidebarGroup key={group.titleKey}>
              <Collapsible
                open={isExpanded}
                onOpenChange={() => handleGroupToggle(group.titleKey, version, isExpanded)}
              >
                {/* Group label — acts as accordion trigger */}
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel
                    className={
                      `text-xs font-medium uppercase tracking-wider cursor-pointer select-none flex items-center justify-between w-full ` +
                      (isActiveGroup
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-muted-foreground hover:text-foreground')
                    }
                    role="button"
                    aria-expanded={isExpanded}
                    aria-level={2}
                  >
                    <span className="group-data-[collapsible=icon]:hidden">{groupTitle}</span>
                    <ChevronDown
                      className={
                        `size-3 shrink-0 transition-transform duration-200 ease-in-out ` +
                        (isExpanded ? 'rotate-180' : 'rotate-0') +
                        ` group-data-[collapsible=icon]:hidden`
                      }
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                {/* Group content — collapsible with animation */}
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        const Icon = item.icon
                        const itemTitle = t(item.titleKey)

                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              tooltip={itemTitle}
                              className={
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-medium [&_svg]:text-emerald-700 dark:[&_svg]:text-emerald-400'
                                  : 'hover:bg-emerald-50/50 hover:text-emerald-700 dark:hover:bg-emerald-900/10 dark:hover:text-emerald-400'
                              }
                            >
                              <Link href={item.href}>
                                <Icon className="size-4" />
                                <span>{itemTitle}</span>
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
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )
        })}
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
              <span className="text-xs text-muted-foreground">{tSidebar('superAdmin')}</span>
            </div>
            <ChevronDown className="size-4 text-muted-foreground rtl-mirror" />
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
