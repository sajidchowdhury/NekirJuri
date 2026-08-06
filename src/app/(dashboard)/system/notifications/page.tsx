'use client';

// ============================================================
// Notification Center Page
// ============================================================

import { motion } from 'framer-motion';
import PageHeader from '@/components/atoms/page-header';
import NotificationCenter from '@/components/system/notification-center';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function NotificationsPage() {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Notification Center"
        description="View and manage system notifications"
        showBismillah
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <NotificationCenter />
      </motion.div>
    </motion.div>
  );
}
