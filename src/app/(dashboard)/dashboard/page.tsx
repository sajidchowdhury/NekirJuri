'use client';

// ============================================================
// Dashboard Page — Main dashboard with stats, charts, and activity
// Fetches data from /api/dashboard with React Query
// ============================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import DashboardHero from '@/components/dashboard/dashboard-hero';
import StatCardsGrid from '@/components/dashboard/stat-cards-grid';
import FeeCollectionChart from '@/components/dashboard/fee-collection-chart';
import StudentDistributionChart from '@/components/dashboard/student-distribution-chart';
import PaymentStatusChart from '@/components/dashboard/payment-status-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import UpcomingEvents from '@/components/dashboard/upcoming-events';
import QuickActions from '@/components/dashboard/quick-actions';
import DashboardOverviewChart from '@/components/dashboard/dashboard-overview-chart';
import DateRangeFilter, { type DateRangeOption } from '@/components/dashboard/date-range-filter';

/** Dashboard API response shape */
interface DashboardData {
  totalStudents: number;
  totalTeachers: number;
  totalEmployees: number;
  totalFeeCollected: number;
  totalFeeOutstanding: number;
  totalDonations: number;
  totalExpenses: number;
  totalSalaryPaid: number;
  activeClasses: number;
  pendingInvoices: number;
  monthlyFeeSummary: Array<{
    month: string;
    monthNum: number;
    year: number;
    collected: number;
    outstanding: number;
  }>;
  recentActivities: Array<{
    id: number;
    action: string;
    description: string;
    createdAt: string;
    entityType?: string;
  }>;
  meta: {
    currentMonth: number;
    currentYear: number;
    monthStart: string;
    monthEnd: string;
  };
}

/** API response wrapper */
interface ApiResponse {
  success: boolean;
  data?: DashboardData;
  error?: string;
}

/** Stagger animation for sections */
const sectionStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const sectionFade = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/**
 * DashboardPage is the main dashboard view that assembles all
 * dashboard components with data fetching and responsive layout.
 */
export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('this_month');
  const t = useTranslations('dashboard');

  // Fetch dashboard data with React Query
  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ['dashboard', dateRange],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const dashboardData = apiResponse?.data ?? null;

  // Transform monthly fee summary for chart
  const feeChartData = dashboardData?.monthlyFeeSummary?.map((m) => ({
    month: m.month.split(' ')[0], // Just the short month name
    collected: Number(m.collected),
    outstanding: Number(m.outstanding),
  }));

  // Transform recent activities
  const recentActivities = dashboardData?.recentActivities?.map((a) => ({
    id: a.id,
    action: a.action,
    description: a.description,
    createdAt: a.createdAt,
    entityType: a.entityType,
  }));

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <p className="text-muted-foreground">{t('failedToLoad')}</p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={sectionStagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Hero Section */}
      <DashboardHero institutionName="Al-Huda Academy" />

      {/* Date Range Filter — right aligned */}
      <div className="flex justify-end">
        <DateRangeFilter
          value={dateRange}
          onChange={(range) => setDateRange(range.option)}
        />
      </div>

      {/* Stat Cards Grid */}
      <motion.div variants={sectionFade}>
        <StatCardsGrid data={dashboardData} loading={isLoading} />
      </motion.div>

      {/* Charts Row 1: Fee Collection (8/12) + Quick Actions (4/12) */}
      <motion.div variants={sectionFade}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FeeCollectionChart
              data={feeChartData}
              loading={isLoading}
            />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </motion.div>

      {/* Charts Row 2: Payment Status (8/12) + Recent Activity (4/12) */}
      <motion.div variants={sectionFade}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PaymentStatusChart loading={isLoading} />
          </div>
          <div>
            <RecentActivity
              activities={recentActivities}
              loading={isLoading}
            />
          </div>
        </div>
      </motion.div>

      {/* Student Distribution + Dashboard Overview */}
      <motion.div variants={sectionFade}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <StudentDistributionChart loading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <DashboardOverviewChart loading={isLoading} />
          </div>
        </div>
      </motion.div>

      {/* Upcoming Events — full width */}
      <motion.div variants={sectionFade}>
        <UpcomingEvents loading={isLoading} />
      </motion.div>
    </motion.div>
  );
}
