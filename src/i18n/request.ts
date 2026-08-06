import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

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

export default getRequestConfig(async () => {
  // Read locale from cookie, fallback to default
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('locale')?.value

  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
