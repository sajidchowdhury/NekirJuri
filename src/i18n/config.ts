// ============================================================
// i18n Config — Client-safe locale constants & types
// This file can be imported from both Server and Client components
// (No server-only imports like next/headers or next-intl/server)
// ============================================================

export const locales = ['en', 'bn', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** RTL locales */
export const rtlLocales: Locale[] = ['ar']

/** Get locale direction */
export function getLocaleDirection(locale: Locale): 'rtl' | 'ltr' {
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr'
}

/** Locale display names */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  bn: 'বাংলা',
  ar: 'العربية',
}

/** Locale native names (for language switcher) */
export const localeLabels: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  bn: { native: 'বাংলা', english: 'Bangla' },
  ar: { native: 'العربية', english: 'Arabic' },
}
