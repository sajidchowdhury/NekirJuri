'use client'

import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="text-6xl">🕌</div>
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        We encountered an error while loading this page. Please try again.
      </p>
      <Button
        onClick={reset}
        className="bg-emerald-600 hover:bg-emerald-700 mt-2"
      >
        Try Again
      </Button>
    </div>
  )
}
