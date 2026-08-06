'use client'

// ============================================================
// useLocale — Hook for managing locale with cookie persistence
// CR-2: Multi-Language System
// ============================================================

import { useCallback } from 'react'
import { useLocale as useNextIntlLocale } from 'next-intl'
import type { Locale } from '@/i18n/request'

export function useAppLocale() {
  const currentLocale = useNextIntlLocale() as Locale

  const setLocale = useCallback(async (locale: Locale) => {
    try {
      const res = await fetch('/api/locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })

      if (res.ok) {
        // Reload the page to apply the new locale
        // This ensures server components get the new locale
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to set locale:', error)
    }
  }, [])

  return { locale: currentLocale, setLocale }
}
