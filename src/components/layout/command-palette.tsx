'use client'

// ============================================================
// CommandPalette — Searchable command palette (⌘K / Ctrl+K)
// Navigate pages and trigger quick actions
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

/** Quick actions for common tasks */
const quickActions = [
  { title: 'Add Student', href: '/academic/students', icon: GraduationCap },
  { title: 'Collect Fee', href: '/finance/collections', icon: Receipt },
  { title: 'Add Expense', href: '/finance/expenses', icon: ReceiptText },
  { title: 'Generate Invoice', href: '/finance/fees', icon: FileText },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

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
      <CommandInput placeholder="Search pages, students, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation pages */}
        {navigation.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.title} ${group.title}`}
                  onSelect={() => runCommand(() => router.push(item.href))}
                >
                  <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{item.title}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        ))}

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <CommandItem
                key={action.title}
                value={action.title}
                onSelect={() => runCommand(() => router.push(action.href))}
              >
                <Icon className="size-4 text-amber-600 dark:text-amber-400" />
                <span>{action.title}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
