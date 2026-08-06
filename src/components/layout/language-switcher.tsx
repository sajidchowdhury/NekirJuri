'use client'

// ============================================================
// LanguageSwitcher — Dropdown to switch between languages
// Shows current language flag/name and allows switching
// CR-2: Multi-Language System (Arabic / English / Bangla)
// ============================================================

import { useTranslations } from 'next-intl'
import { Languages } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAppLocale } from '@/hooks/use-locale'
import type { Locale } from '@/i18n/request'
import { localeLabels, rtlLocales } from '@/i18n/request'

const locales: Locale[] = ['en', 'bn', 'ar']

/** Flag emojis for each locale */
const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  bn: '🇧🇩',
  ar: '🇸🇦',
}

/** Apply RTL and font changes to the DOM immediately (before cookie reload) */
function applyLocaleToDOM(newLocale: Locale) {
  const htmlEl = document.documentElement
  const isRtl = rtlLocales.includes(newLocale)
  htmlEl.setAttribute('dir', isRtl ? 'rtl' : 'ltr')
  htmlEl.setAttribute('lang', newLocale)

  const bodyEl = document.body
  if (newLocale === 'ar') {
    bodyEl.style.fontFamily = 'var(--font-arabic), sans-serif'
  } else if (newLocale === 'bn') {
    bodyEl.style.fontFamily = 'var(--font-bengali), sans-serif'
  } else {
    bodyEl.style.fontFamily = 'var(--font-sans), sans-serif'
  }
}

export function LanguageSwitcher() {
  const t = useTranslations('language')
  const { locale, setLocale } = useAppLocale()

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === locale) return

    // Apply DOM changes immediately for instant visual feedback
    applyLocaleToDOM(newLocale)

    // Persist and reload
    await setLocale(newLocale)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={t('switchLabel')}
        >
          <Languages className="size-4" />
          <span className="sr-only">{t('title')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={`cursor-pointer gap-2 ${locale === loc ? 'bg-emerald-50 dark:bg-emerald-900/20 font-medium' : ''}`}
          >
            <span className="text-base leading-none">{localeFlags[loc]}</span>
            <span className="flex-1">{localeLabels[loc].native}</span>
            {locale === loc && (
              <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSwitcher
