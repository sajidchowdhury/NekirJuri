import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { MobileNav } from '@/components/layout/mobile-nav'
import PageTransition from '@/components/ui/page-transition'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </SidebarInset>
      <MobileNav />
    </SidebarProvider>
  )
}
