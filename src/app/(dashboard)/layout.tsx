import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import PageTransition from '@/components/ui/page-transition'
import { SkipToContent } from '@/components/ui/skip-to-content'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { SubscriptionBanner } from '@/components/subscription/subscription-banner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SkipToContent />
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <SubscriptionBanner
          status="active"
          level="full"
          daysRemaining={5}
          trialDaysRemaining={0}
          isExpired={false}
          isInTrial={false}
        />
        <main
          id="main-content"
          role="main"
          aria-label="Main content"
          className="flex-1 p-4 sm:p-6 pb-20 md:pb-6"
          tabIndex={-1}
        >
          <ErrorBoundary>
            <PageTransition>{children}</PageTransition>
          </ErrorBoundary>
        </main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  )
}
