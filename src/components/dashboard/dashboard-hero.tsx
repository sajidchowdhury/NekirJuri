'use client';

// ============================================================
// DashboardHero — Welcome section with institution name and date
// Features CrescentLogo and emerald gradient text
// CR-1: Bismillah removed (now in top bar only)
// ============================================================

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import CrescentLogo from '@/components/islamic/crescent-logo';

export interface DashboardHeroProps {
  /** Institution name (default: 'Al-Huda Academy') */
  institutionName?: string;
}

/**
 * DashboardHero renders the welcome section at the top of the dashboard
 * with the CrescentLogo, institution name in emerald gradient, and current date.
 */
export default function DashboardHero({
  institutionName = 'Al-Huda Academy',
}: DashboardHeroProps) {
  const today = new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col gap-4"
    >
      {/* Main row: welcome + date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Logo + welcome */}
        <div className="flex items-center gap-4">
          <CrescentLogo size="lg" animated />
          <div>
            <p className="text-sm text-muted-foreground">Welcome back to</p>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-300 dark:to-amber-400">
              {institutionName}
            </h1>
          </div>
        </div>

        {/* Right: Current date */}
        <div className="flex flex-col items-start sm:items-end gap-0.5">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-lg font-semibold text-foreground">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
