'use client';

// ============================================================
// DonationDashboard — Stats, trend chart, top donors, category breakdown
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  HandHeart, TrendingUp, Users, CalendarDays, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import StatCard from '@/components/molecules/stat-card';
import {
  sampleDonors,
  sampleDonationTrend,
  sampleDonationCategoryBreakdown,
  sampleDonations,
  formatTaka,
  type DonationCategory,
} from '@/lib/finance/sample-data';

const categoryColors: Record<DonationCategory, string> = {
  zakat: '#059669',
  sadaqah: '#d97706',
  general: '#0284c7',
  construction: '#7c3aed',
  education: '#0891b2',
};

const categoryLabels: Record<DonationCategory, string> = {
  zakat: 'Zakat / যাকাত',
  sadaqah: 'Sadaqah / সাদাকাহ',
  general: 'General / সাধারণ',
  construction: 'Construction / নির্মাণ',
  education: 'Education / শিক্ষা',
};

export default function DonationDashboard() {
  // Compute stats from sample data (defensive checks)
  const donations = sampleDonations ?? [];
  const donors = sampleDonors ?? [];

  const totalThisMonth = donations
    .filter((d) => d.date?.startsWith('2025-02'))
    .reduce((sum, d) => sum + d.amount, 0);

  const totalThisYear = donations
    .reduce((sum, d) => sum + d.amount, 0);

  const numDonors = donors.length;
  const avgDonation = donations.length > 0 ? Math.round(totalThisYear / donations.length) : 0;

  // Top 3 donors by totalDonated
  const topDonors = [...donors]
    .sort((a, b) => b.totalDonated - a.totalDonated)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="This Month"
          value={formatTaka(totalThisMonth)}
          icon={CalendarDays}
          variant="emerald"
          trend={{ value: 15.2, label: 'vs last month' }}
        />
        <StatCard
          title="This Year Total"
          value={formatTaka(totalThisYear)}
          icon={HandHeart}
          variant="gold"
          trend={{ value: 22.4, label: 'vs last year' }}
        />
        <StatCard
          title="Number of Donors"
          value={numDonors.toString()}
          icon={Users}
          variant="default"
          trend={{ value: 8.3, label: 'new this month' }}
        />
        <StatCard
          title="Avg Donation"
          value={formatTaka(avgDonation)}
          icon={TrendingUp}
          variant="default"
        />
      </div>

      {/* Trend Chart + Top Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart — Donation Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Donation Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampleDonationTrend} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val: number) => `৳${(val / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatTaka(value), 'Donations']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#059669"
                    strokeWidth={2}
                    fill="url(#donationGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Donors */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Donors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDonors.map((donor, idx) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{idx + 1}</span>
                </div>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    {donor.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{donor.name}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabels[donor.category].split('/')[0].trim()}</p>
                </div>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 shrink-0">
                  {formatTaka(donor.totalDonated)}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Donation by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {sampleDonationCategoryBreakdown.map((item, idx) => {
              const maxAmount = Math.max(...sampleDonationCategoryBreakdown.map((b) => b.amount));
              const percentage = (item.amount / maxAmount) * 100;
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.06 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColors[item.category] }}
                    />
                    <p className="text-xs font-medium text-muted-foreground">
                      {categoryLabels[item.category].split('/')[0].trim()}
                    </p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: categoryColors[item.category] }}>
                    {formatTaka(item.amount)}
                  </p>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: categoryColors[item.category],
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{item.count} donations</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CR-5: Upcoming Recurring Donations Widget */}
      <Card className="border-t-[3px] border-t-amber-500 dark:border-t-amber-400">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-amber-500" />
              Upcoming Recurring Donations
            </CardTitle>
            <span className="text-xs text-muted-foreground">Next 30 days</span>
          </div>
        </CardHeader>
        <CardContent>
          <RecurringDonationsWidget />
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** CR-5: Widget showing upcoming recurring donations from API */
function RecurringDonationsWidget() {
  const [donations, setDonations] = React.useState<Array<{
    id: number;
    receiptNo: string;
    amount: number;
    recurringAmount?: number | null;
    recurringFrequency?: string | null;
    nextDueDate?: string | null;
    donor?: { name: string } | null;
    donationCategory?: { name: string } | null;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch('/api/donations?isRecurring=true&upcomingDays=30&limit=10');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data || []);
        setDonations(items);
      } catch {
        setDonations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No upcoming recurring donations in the next 30 days.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {donations.map((d) => {
        const dueDate = d.nextDueDate ? new Date(d.nextDueDate) : null;
        const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
        const isUrgent = daysUntilDue !== null && daysUntilDue <= 3;

        return (
          <div key={d.id} className="flex items-center gap-3 px-1 py-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isUrgent ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
              <RefreshCw className={`h-4 w-4 ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{d.donor?.name || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">
                ৳{(Number(d.recurringAmount || d.amount)).toLocaleString('en-IN')}/{d.recurringFrequency === 'monthly' ? 'mo' : 'yr'}
                {' • '}
                {d.donationCategory?.name || ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              {dueDate && (
                <p className={`text-xs font-medium ${isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {daysUntilDue !== null && daysUntilDue <= 0 ? 'Overdue!' : `${daysUntilDue}d left`}
                </p>
              )}
              {dueDate && (
                <p className="text-[10px] text-muted-foreground">
                  {dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
