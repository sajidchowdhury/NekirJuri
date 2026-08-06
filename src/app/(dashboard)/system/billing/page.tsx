'use client'

// ============================================================
// Billing Page Route — /system/billing
// Renders the BillingPage component for subscription management
// ============================================================

import { motion } from 'framer-motion'
import PageHeader from '@/components/atoms/page-header'
import BillingPage from '@/components/subscription/billing-page'
import { fadeIn, transitions } from '@/lib/animations'

export default function BillingRoutePage() {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription plan, payments, and billing history"

      />

      <BillingPage />
    </motion.div>
  )
}
