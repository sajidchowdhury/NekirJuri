import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { locales, defaultLocale, type Locale } from './config'

// Re-export for convenience in Server Components only
export { locales, defaultLocale, type Locale, rtlLocales, localeNames, localeLabels, getLocaleDirection } from './config'

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
