'use client';

// ============================================================
// System Settings Page — Settings + Institution Profile
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/atoms/page-header';
import SettingsPage, { type SettingsState, defaultSettings } from '@/components/system/settings-page';
import InstitutionProfile from '@/components/system/institution-profile';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function SettingsPageWrapper() {
  const [settings, setSettings] = React.useState<SettingsState>(defaultSettings);

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="System Settings"
        description="Configure system settings and institution profile"

      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        {/* Mobile: Profile at top, Settings below */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Settings */}
          <div className="flex-1 min-w-0">
            <SettingsPage
              settings={settings}
              onSettingsChange={setSettings}
            />
          </div>

          {/* Right: Institution Profile (sticky on desktop) */}
          <div className="lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <InstitutionProfile settings={settings} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
