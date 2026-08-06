'use client'

// ============================================================
// Root Page — Landing/redirect page
// Shows a brief loading state then navigates to dashboard
// ============================================================

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Small delay to allow the page to render before navigation
    const timer = setTimeout(() => {
      router.replace('/dashboard')
    }, 100)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="size-8 text-emerald-600 dark:text-emerald-400" />
          <h1 className="text-2xl font-bold text-foreground">Madrasha ERP</h1>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    </div>
  )
}
