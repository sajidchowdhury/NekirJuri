'use client';

// ============================================================
// Activity & Audit Log Page
// ============================================================

import { motion } from 'framer-motion';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ActivityLogViewer from '@/components/system/activity-log-viewer';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function ActivityLogsPage() {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Activity & Audit Logs"
        description="View system activity logs and audit trail"
        showBismillah
        actions={
          <ExportButton
            onExportCSV={() => {}}
            onExportPDF={() => {}}
          />
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <ActivityLogViewer />
      </motion.div>
    </motion.div>
  );
}
