'use client'

// ============================================================
// UserMenu — Avatar dropdown for user profile actions
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import { useTranslations } from 'next-intl'
import { User, Settings, LogOut } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const t = useTranslations('userMenu')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Avatar className="size-8">
            <AvatarFallback className="bg-emerald-700 text-white text-xs font-medium dark:bg-emerald-600">
              SA
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">{t('srLabel')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">Sajid Admin</p>
            <p className="text-xs text-muted-foreground">sajid@alhuda.edu</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer">
            <User className="size-4" />
            <span>{t('profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="size-4" />
            <span>{t('settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" className="cursor-pointer">
          <LogOut className="size-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
