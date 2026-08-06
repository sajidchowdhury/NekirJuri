'use client'

// ============================================================
// SubscriptionGuard — Feature gate wrapper component
// Checks enforcement level and either:
// - Blocks content with a locked message + upgrade CTA (blocked/terminated)
// - Renders children in read-only mode (readonly)
// - Renders children normally (full access)
// Passes enforcement info to children via React context
// ============================================================

import { createContext, useContext, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { EnforcementLevel } from '@/lib/subscription'
import { fadeIn, slideUp, transitions } from '@/lib/animations'

// -----------------------------------------------------------
// Subscription Guard Context
// -----------------------------------------------------------

export interface SubscriptionGuardContextValue {
  /** Current enforcement level */
  level: EnforcementLevel
  /** Whether the user can write (full access) */
  canWrite: boolean
  /** Whether the user can read (full or readonly) */
  canRead: boolean
  /** Whether the feature is blocked */
  isBlocked: boolean
}

const SubscriptionGuardContext = createContext<SubscriptionGuardContextValue>({
  level: 'full',
  canWrite: true,
  canRead: true,
  isBlocked: false,
})

/** Hook to access subscription guard context */
export function useSubscriptionGuard() {
  return useContext(SubscriptionGuardContext)
}

// -----------------------------------------------------------
// SubscriptionGuard Component
// -----------------------------------------------------------

export interface SubscriptionGuardProps {
  /** Current enforcement level */
  level: EnforcementLevel | string
  /** Child components to render if access is allowed */
  children: ReactNode
  /** Optional feature name for the locked message */
  featureName?: string
  /** Custom message when blocked */
  blockedMessage?: string
  /** Whether to show the lock overlay on readonly mode */
  showReadOnlyOverlay?: boolean
}

/**
 * SubscriptionGuard wraps feature content and gates it
 * based on the subscription enforcement level.
 *
 * - blocked/restricted: Shows locked message with upgrade CTA
 * - readonly: Renders children but with a read-only indicator
 * - full: Renders children normally
 */
export function SubscriptionGuard({
  level,
  children,
  featureName = 'This feature',
  blockedMessage,
  showReadOnlyOverlay = false,
}: SubscriptionGuardProps) {
  const isBlocked = level === 'blocked' || level === 'restricted'
  const canWrite = level === 'full'
  const canRead = level === 'full' || level === 'readonly'
  const isReadOnly = level === 'readonly'

  const contextValue: SubscriptionGuardContextValue = {
    level: level as EnforcementLevel,
    canWrite,
    canRead,
    isBlocked,
  }

  // Blocked state — show locked message
  if (isBlocked) {
    return (
      <SubscriptionGuardContext.Provider value={contextValue}>
        <motion.div
          initial={fadeIn.initial}
          animate={fadeIn.animate}
          transition={transitions.normal}
        >
          <Card className="border-dashed border-2 border-rose-200 dark:border-rose-800">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 mb-4">
                <Lock className="size-8 text-rose-500 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {featureName} is Locked
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                {blockedMessage ?? `${featureName} is not available on your current plan. Upgrade your subscription to access all features.`}
              </p>
              <Button asChild className="gap-2">
                <Link href="/system/billing">
                  <Lock className="size-4" />
                  Upgrade Subscription
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </SubscriptionGuardContext.Provider>
    )
  }

  // Read-only state — render with optional overlay
  if (isReadOnly) {
    return (
      <SubscriptionGuardContext.Provider value={contextValue}>
        <div className="relative">
          {/* Read-only indicator bar */}
          {showReadOnlyOverlay && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 px-3 py-1.5 flex items-center gap-2">
              <Eye className="size-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Read-only mode — editing is disabled
              </span>
            </div>
          )}

          {/* Intercepted children — forms and buttons are disabled */}
          <div
            className={showReadOnlyOverlay ? 'pt-8' : ''}
            onClick={(e) => {
              // Intercept clicks on buttons and form submissions
              const target = e.target as HTMLElement
              const button = target.closest('button[type="submit"], button:not([type]), input[type="submit"]')
              if (button && !button.closest('a[href]')) {
                e.preventDefault()
                e.stopPropagation()
              }
            }}
            onSubmit={(e) => {
              // Prevent form submissions
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {children}
          </div>
        </div>
      </SubscriptionGuardContext.Provider>
    )
  }

  // Full access — render normally
  return (
    <SubscriptionGuardContext.Provider value={contextValue}>
      {children}
    </SubscriptionGuardContext.Provider>
  )
}

export default SubscriptionGuard
