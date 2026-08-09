import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Noto_Sans_Bengali } from "next/font/google";
import { Noto_Naskh_Arabic } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-provider";
import { ErrorBoundaryProvider } from "@/components/providers/error-boundary-provider";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { getLocaleDirection, type Locale } from "@/i18n/config";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bengali",
  subsets: ["bengali"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const notoArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Madrasha ERP — Islamic Education Management System",
  description: "Comprehensive ERP & Accounting Management System for Islamic Educational Institutions. Manage students, fees, payroll, inventory, and more.",
  keywords: ["Madrasha", "ERP", "Islamic Education", "Student Management", "Fee Management", "Accounting"],
  authors: [{ name: "Madrasha ERP" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale() as Locale;
  const dir = getLocaleDirection(locale);
  const messages = await getMessages();

  // Determine the font class based on locale
  const localeFontClass = locale === 'ar'
    ? 'font-arabic'
    : locale === 'bn'
    ? 'font-bengali'
    : 'font-sans';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoBengali.variable} ${notoArabic.variable} ${jetbrainsMono.variable} ${localeFontClass} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ErrorBoundaryProvider>
              <QueryProvider>
                <WebVitalsReporter />
                <div className="min-h-screen flex flex-col bg-background text-foreground">
                  {children}
                </div>
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    classNames: {
                      toast: "bg-card text-card-foreground border-border",
                    },
                  }}
                />
              </QueryProvider>
            </ErrorBoundaryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
