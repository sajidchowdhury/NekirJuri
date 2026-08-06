'use client';

// ============================================================
// StatCardsGrid — Responsive grid of 4 key metric stat cards
// Shows: Total Students, Fee Collection, Pending Fees, Collection Rate
// Phase 11: Enabled count-up animation (animateValue) for stat cards
// ============================================================

import { motion } from 'framer-motion';
import { GraduationCap, Banknote, ReceiptText, TrendingUp } from 'lucide-react';
import StatCard from '@/components/molecules/stat-card';
import { staggerFast } from '@/lib/animations';

/** Dashboard data shape (matches API response) */
export interface DashboardStats {
  totalStudents?: number;
  totalFeeCollected?: number;
  totalFeeOutstanding?: number;
  activeClasses?: number;
  totalTeachers?: number;
  pendingInvoices?: number;
  totalExpenses?: number;
  totalDonations?: number;
  totalSalaryPaid?: number;
  [key: string]: unknown;
}

export interface StatCardsGridProps {
  /** Dashboard statistics data */
  data?: DashboardStats | null;
  /** Loading state */
  loading?: boolean;
}

/** Format number as currency (PKR) */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number with commas */
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * StatCardsGrid renders 4 StatCards in a responsive grid
 * showing the most important dashboard metrics.
 * Stats animate with count-up from 0 on initial load.
 */
export default function StatCardsGrid({
  data,
  loading = false,
}: StatCardsGridProps) {
  const totalStudents = data?.totalStudents ?? 0;
  const feeCollected = data?.totalFeeCollected ?? 0;
  const feeOutstanding = data?.totalFeeOutstanding ?? 0;
  const collectionRate =
    feeCollected + feeOutstanding > 0
      ? Math.round((feeCollected / (feeCollected + feeOutstanding)) * 100)
      : 0;

  const cards = [
    {
      title: 'Total Students',
      value: formatNumber(totalStudents),
      icon: GraduationCap,
      variant: 'emerald' as const,
      trend: { value: 12, label: 'vs last month' },
    },
    {
      title: 'Fee Collected',
      value: formatCurrency(feeCollected),
      icon: Banknote,
      variant: 'gold' as const,
      trend: { value: 8, label: 'vs last month' },
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(feeOutstanding),
      icon: ReceiptText,
      variant: 'rose' as const,
      trend: { value: -3, label: 'vs last month' },
    },
    {
      title: 'Collection Rate',
      value: `${collectionRate}%`,
      icon: TrendingUp,
      variant: 'default' as const,
      trend: { value: 5, label: 'vs last month' },
    },
  ];

  return (
    <motion.div
      variants={staggerFast}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
          trend={card.trend}
          loading={loading}
          animateValue={!loading}
        />
      ))}
    </motion.div>
  );
}
