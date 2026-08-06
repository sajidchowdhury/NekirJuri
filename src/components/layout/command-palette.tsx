'use client'

// ============================================================
// CommandPalette — Searchable command palette (⌘K / Ctrl+K)
// Navigate pages and trigger quick actions
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  GraduationCap, Receipt, ReceiptText, FileText,
} from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import { navigation } from '@/config/navigation'

/** Quick actions for common tasks (keys for translation) */
const quickActionKeys = [
  { titleKey: 'addStudent', href: '/academic/students', icon: GraduationCap },
  { titleKey: 'collectFee', href: '/finance/collections', icon: Receipt },
  { titleKey: 'addExpense', href: '/finance/expenses', icon: ReceiptText },
  { titleKey: 'generateInvoice', href: '/finance/fees', icon: FileText },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations('commandPalette')
  const tNav = useTranslations('nav')

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('placeholder')} />
      <CommandList>
        <CommandEmpty>{t('noResults')}</CommandEmpty>

        {/* Navigation pages */}
        {navigation.map((group) => (
          <CommandGroup key={group.titleKey} heading={tNav(group.titleKey)}>
            {group.items.map((item) => {
              const Icon = item.icon
              const itemTitle = tNav(item.titleKey)
              return (
                <CommandItem
                  key={item.href}
                  value={`${itemTitle} ${tNav(group.titleKey)}`}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{itemTitle}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading={t('quickActions')}>
          {quickActionKeys.map((action) => {
            const Icon = action.icon
            const actionTitle = t(action.titleKey)
            return (
              <CommandItem
                key={action.titleKey}
                value={actionTitle}
                onSelect={() => runCommand(() => router.push(action.href))}
              >
                <Icon className="size-4 text-amber-600 dark:text-amber-400" />
                <span>{actionTitle}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
