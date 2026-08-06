'use client'

// ============================================================
// SkipToContent — Visually hidden link that appears on Tab focus
// First focusable element; skips to main content area
// ============================================================

import { cn } from '@/lib/utils'

export function SkipToContent({ className }: { className?: string }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-2 focus:left-2 focus:z-[9999]',
        'focus:inline-flex focus:items-center focus:justify-center',
        'focus:rounded-md focus:px-4 focus:py-2',
        'focus:bg-emerald-700 focus:text-white focus:font-medium focus:text-sm',
        'focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2',
        'transition-colors duration-150',
        className
      )}
    >
      Skip to main content
    </a>
  )
}

export default SkipToContent
