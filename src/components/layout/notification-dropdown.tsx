'use client'

// ============================================================
// NotificationDropdown — Bell icon with notification badge & dropdown
// Shows recent notifications with timestamps
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import { useTranslations } from 'next-intl'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Sample notification data */
const notifications = [
  {
    id: 1,
    titleKey: 'feePaymentReceived' as const,
    description: 'Abdullah Rahim paid ৳5,000',
    time: '2 min ago',
  },
  {
    id: 2,
    titleKey: 'newStudentAdmitted' as const,
    description: 'Fatima Khatun admitted to Class 5',
    time: '15 min ago',
  },
  {
    id: 3,
    titleKey: 'salaryProcessed' as const,
    description: 'March 2025 payroll completed',
    time: '1 hour ago',
  },
]

export function NotificationDropdown() {
  const t = useTranslations('notifications')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={t('title')}
          aria-haspopup="true"
        >
          <Bell className="size-4" />
          {/* Red badge */}
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>
          <span className="sr-only">{t('title')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('title')}</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal cursor-pointer hover:underline">
            {t('markAllRead')}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium text-foreground">
                  {t(notification.titleKey)}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                  {notification.time}
                </span>
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {notification.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center justify-center text-sm text-emerald-600 dark:text-emerald-400 font-medium cursor-pointer">
          {t('viewAll')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
