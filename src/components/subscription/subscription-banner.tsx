'use client'

// ============================================================
// SubscriptionBanner — Warning banner shown in dashboard layout
// based on subscription enforcement level.
// Shows colored bar with icon, message, and "Manage Subscription" link.
// Dismissible for active subscriptions (stores in localStorage for 1 day).
// ============================================================

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Clock, ShieldAlert, Ban, X,
  CreditCard, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubscriptionStatus, EnforcementLevel } from '@/lib/subscription'
import { slideUp, transitions } from '@/lib/animations'

/** Props for SubscriptionBanner */
export interface SubscriptionBannerProps {
  /** Current subscription status */
  status: SubscriptionStatus | string
  /** Current enforcement level */
  level: EnforcementLevel | string
  /** Days remaining in subscription */
  daysRemaining?: number
  /** Days remaining in trial */
  trialDaysRemaining?: number
  /** Whether subscription is expired */
  isExpired?: boolean
  /** Whether in trial mode */
  isInTrial?: boolean
  /** Warning messages from enforcement */
  warnings?: string[]
}

/** localStorage key prefix for dismiss state */
const DISMISS_KEY_PREFIX = 'sub-banner-dismissed-'

/** Get dismiss key for a status */
function getDismissKey(status: string): string {
  return DISMISS_KEY_PREFIX + status
}

/** Check if a banner was dismissed recently (within 24h) */
function isDismissed(status: string): boolean {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(getDismissKey(status))
  if (!raw) return false
  const dismissedAt = Number(raw)
  // 1 day = 86400000 ms
  return Date.now() - dismissedAt < 86_400_000
}

/** Mark a banner as dismissed */
function setDismissed(status: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getDismissKey(status), String(Date.now()))
}

/** Banner style configuration per status */
interface BannerStyle {
  bg: string
  text: string
  icon: React.ReactNode
  message: string
  dismissible: boolean
}

/** Determine the banner style based on status and enforcement */
function getBannerStyle(
  status: string,
  level: string,
  daysRemaining: number,
  trialDaysRemaining: number
): BannerStyle | null {
  switch (status) {
    case 'trial':
      if (trialDaysRemaining <= 0) {
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
          text: 'text-rose-800 dark:text-rose-300',
          icon: <Ban className="size-5 shrink-0" />,
          message: 'Trial period has expired. Subscribe now to continue using all features.',
          dismissible: false,
        }
      }
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-300',
        icon: <Clock className="size-5 shrink-0" />,
        message: `Trial expires in ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''}. Subscribe now to avoid interruption.`,
        dismissible: trialDaysRemaining > 3,
      }

    case 'active':
      if (level === 'readonly') {
        // Expired but in grace period
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-300',
          icon: <AlertTriangle className="size-5 shrink-0" />,
          message: 'Subscription expired — renew within 14 days to keep full access.',
          dismissible: false,
        }
      }
      if (daysRemaining <= 7) {
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
          text: 'text-amber-800 dark:text-amber-300',
          icon: <Clock className="size-5 shrink-0" />,
          message: `Subscription expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to avoid service interruption.`,
          dismissible: true,
        }
      }
      // Active with plenty of time remaining — no banner
      return null

    case 'grace_period':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-300',
        icon: <AlertTriangle className="size-5 shrink-0" />,
        message: 'Subscription expired — renew within 14 days to keep full access.',
        dismissible: false,
      }

    case 'restricted':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
        text: 'text-orange-800 dark:text-orange-300',
        icon: <ShieldAlert className="size-5 shrink-0" />,
        message: 'Access restricted — admin only, read-only mode.',
        dismissible: false,
      }

    case 'suspended':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        text: 'text-rose-800 dark:text-rose-300',
        icon: <Ban className="size-5 shrink-0" />,
        message: 'Account suspended — data will be deleted unless renewed. Contact support.',
        dismissible: false,
      }

    case 'terminated':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700',
        text: 'text-rose-900 dark:text-rose-200',
        icon: <Ban className="size-5 shrink-0" />,
        message: 'Account terminated — contact support immediately.',
        dismissible: false,
      }

    case 'cancelled':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        text: 'text-rose-800 dark:text-rose-300',
        icon: <Ban className="size-5 shrink-0" />,
        message: 'Subscription cancelled. Contact support to reactivate.',
        dismissible: false,
      }

    default:
      return null
  }
}

/**
 * SubscriptionBanner renders a full-width colored warning bar
 * based on the current subscription enforcement level.
 */
export function SubscriptionBanner({
  status,
  level,
  daysRemaining = 0,
  trialDaysRemaining = 0,
  isExpired = false,
  isInTrial = false,
  warnings = [],
}: SubscriptionBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return isDismissed(status)
  })

  const style = getBannerStyle(status, level, daysRemaining, trialDaysRemaining)

  // No banner needed
  if (!style) return null

  // User dismissed this banner
  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    setDismissed(status)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        exit={slideUp.exit}
        transition={transitions.fast}
        className={`w-full border-b ${style.bg}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          {/* Icon */}
          <div className={`shrink-0 ${style.text}`}>
            {style.icon}
          </div>

          {/* Message */}
          <p className={`flex-1 text-sm font-medium ${style.text}`}>
            {style.message}
          </p>

          {/* Manage Subscription link */}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-7 gap-1.5 text-xs border-current/20 bg-transparent hover:bg-current/10"
            asChild
          >
            <Link href="/system/billing">
              <CreditCard className="size-3.5" />
              <span className="hidden sm:inline">Manage Subscription</span>
              <span className="sm:hidden">Manage</span>
            </Link>
          </Button>

          {/* Dismiss button (only for active subscriptions) */}
          {style.dismissible && (
            <button
              onClick={handleDismiss}
              className={`shrink-0 rounded-sm p-0.5 opacity-70 hover:opacity-100 transition-opacity ${style.text}`}
              aria-label="Dismiss banner"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SubscriptionBanner
