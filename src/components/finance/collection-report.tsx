'use client';

// ============================================================
// CollectionReport — Summary cards + breakdown by method + bar chart
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Banknote, TrendingUp, Calendar, CalendarDays, CalendarRange
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import StatCard from '@/components/molecules/stat-card';
import {
  collectionSummary,
  formatTaka,
  type PaymentMethod,
} from '@/lib/finance/sample-data';

const methodColors: Record<PaymentMethod, string> = {
  cash: '#059669',
  bkash: '#d97706',
  bank: '#0284c7',
  cheque: '#9333ea',
};

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash / নগদ',
  bkash: 'bKash / বিকাশ',
  bank: 'Bank / ব্যাংক',
  cheque: 'Cheque / চেক',
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4 text-emerald-600" />,
  bkash: <TrendingUp className="h-4 w-4 text-amber-600" />,
  bank: <CalendarDays className="h-4 w-4 text-sky-600" />,
  cheque: <CalendarRange className="h-4 w-4 text-violet-600" />,
};

export default function CollectionReport() {
  const { todayCollection, thisMonthCollection, thisYearCollection, byMethod } = collectionSummary;

  const chartData = Object.entries(byMethod).map(([method, data]) => ({
    name: methodLabels[method as PaymentMethod].split('/')[0].trim(),
    amount: data.amount,
    count: data.count,
    percentage: data.percentage,
    fill: methodColors[method as PaymentMethod],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Collection"
          value={formatTaka(todayCollection)}
          icon={Calendar}
          variant="emerald"
          trend={{ value: 12.5, label: 'vs yesterday' }}
        />
        <StatCard
          title="This Month"
          value={formatTaka(thisMonthCollection)}
          icon={CalendarDays}
          variant="gold"
          trend={{ value: 8.3, label: 'vs last month' }}
        />
        <StatCard
          title="This Year"
          value={formatTaka(thisYearCollection)}
          icon={CalendarRange}
          variant="default"
          trend={{ value: 15.2, label: 'vs last year' }}
        />
      </div>

      {/* Breakdown by method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Method cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection by Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byMethod).map(([method, data], idx) => (
              <motion.div
                key={method}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  {methodIcons[method as PaymentMethod]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{methodLabels[method as PaymentMethod]}</p>
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatTaka(data.amount)}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${data.percentage}%`,
                          backgroundColor: methodColors[method as PaymentMethod],
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{data.percentage}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{data.count} transactions</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val: number) => `৳${(val / 1000).toFixed(0)}k`}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatTaka(value), 'Amount']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
