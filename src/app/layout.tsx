import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Noto_Sans_Bengali } from "next/font/google";
import { Noto_Naskh_Arabic } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/components/providers/query-provider";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoBengali.variable} ${notoArabic.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
