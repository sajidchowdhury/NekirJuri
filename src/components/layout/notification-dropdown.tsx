'use client'

// ============================================================
// NotificationDropdown — Bell icon with notification badge & dropdown
// Shows recent notifications with timestamps
// ============================================================

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
    title: 'Fee payment received',
    description: 'Abdullah Rahim paid ৳5,000',
    time: '2 min ago',
  },
  {
    id: 2,
    title: 'New student admitted',
    description: 'Fatima Khatun admitted to Class 5',
    time: '15 min ago',
  },
  {
    id: 3,
    title: 'Salary processed',
    description: 'March 2025 payroll completed',
    time: '1 hour ago',
  },
]

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
          {/* Red badge */}
          <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal cursor-pointer hover:underline">
            Mark all as read
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
                  {notification.title}
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
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
