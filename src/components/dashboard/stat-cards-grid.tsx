'use client';

// ============================================================
// StatCardsGrid — Responsive grid of 4 key metric stat cards
// Shows: Total Students, Fee Collection, Pending Fees, Collection Rate
// Phase 11: Enabled count-up animation (animateValue) for stat cards
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
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

/** Format number as currency with locale awareness */
function formatCurrency(amount: number, locale: string): string {
  const currencyCode = locale === 'bn' ? 'BDT' : locale === 'ar' ? 'SAR' : 'PKR';
  const localeTag = locale === 'bn' ? 'bn-BD' : locale === 'ar' ? 'ar-SA' : 'en-PK';
  return new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number with locale awareness */
function formatNumber(num: number, locale: string): string {
  const localeTag = locale === 'bn' ? 'bn-BD' : locale === 'ar' ? 'ar-SA' : 'en-US';
  return new Intl.NumberFormat(localeTag).format(num);
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
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const totalStudents = data?.totalStudents ?? 0;
  const feeCollected = data?.totalFeeCollected ?? 0;
  const feeOutstanding = data?.totalFeeOutstanding ?? 0;
  const collectionRate =
    feeCollected + feeOutstanding > 0
      ? Math.round((feeCollected / (feeCollected + feeOutstanding)) * 100)
      : 0;

  const cards = [
    {
      title: t('totalStudents'),
      value: formatNumber(totalStudents, locale),
      icon: GraduationCap,
      variant: 'emerald' as const,
      trend: { value: 12, label: tCommon('vsLastMonth') },
    },
    {
      title: t('feeCollected'),
      value: formatCurrency(feeCollected, locale),
      icon: Banknote,
      variant: 'gold' as const,
      trend: { value: 8, label: tCommon('vsLastMonth') },
    },
    {
      title: t('pendingFees'),
      value: formatCurrency(feeOutstanding, locale),
      icon: ReceiptText,
      variant: 'rose' as const,
      trend: { value: -3, label: tCommon('vsLastMonth') },
    },
    {
      title: t('collectionRate'),
      value: `${collectionRate}%`,
      icon: TrendingUp,
      variant: 'default' as const,
      trend: { value: 5, label: tCommon('vsLastMonth') },
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
