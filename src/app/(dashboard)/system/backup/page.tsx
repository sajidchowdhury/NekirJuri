'use client';

// ============================================================
// Backup & Restore Page Route — System module
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import BackupPage from '@/components/backup/backup-page';
import { fadeIn, transitions } from '@/lib/animations';

export default function BackupPageRoute() {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
    >
      <BackupPage />
    </motion.div>
  );
}
