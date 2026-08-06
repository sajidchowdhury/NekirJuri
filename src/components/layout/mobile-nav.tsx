'use client'

// ============================================================
// MobileNav — Bottom tab bar for mobile navigation
// Shows 5 main tabs from mobileTabs config
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { mobileTabs } from '@/config/navigation'

export function MobileNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  return (
    <nav
      className="fixed bottom-0 start-0 end-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur-md"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-14 pb-safe">
        {mobileTabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full
                transition-colors duration-150
                ${isActive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium truncate px-1">
                {t(tab.titleKey)}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
