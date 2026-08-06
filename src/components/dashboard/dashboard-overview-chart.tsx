'use client';

// ============================================================
// DashboardOverviewChart — Line chart: revenue vs expenses over months
// Emerald for revenue, rose for expenses
// ============================================================

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/** Revenue vs expense data point */
export interface RevenueExpenseData {
  month: string;
  revenue: number;
  expenses: number;
}

export interface DashboardOverviewChartProps {
  /** Chart data */
  data?: RevenueExpenseData[];
  /** Loading state */
  loading?: boolean;
}

/** Sample data used when no real data is available */
const sampleData: RevenueExpenseData[] = [
  { month: 'Mar', revenue: 52000, expenses: 38000 },
  { month: 'Apr', revenue: 58000, expenses: 41000 },
  { month: 'May', revenue: 54000, expenses: 39000 },
  { month: 'Jun', revenue: 67000, expenses: 45000 },
  { month: 'Jul', revenue: 61000, expenses: 42000 },
  { month: 'Aug', revenue: 72000, expenses: 48000 },
];

/** Custom tooltip formatter */
function formatTooltipValue(value: number) {
  return `₨ ${value.toLocaleString()}`;
}

/**
 * DashboardOverviewChart displays a line chart comparing
 * revenue (emerald) vs expenses (rose) over the academic session.
 */
export default function DashboardOverviewChart({
  data,
  loading = false,
}: DashboardOverviewChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData;

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
    >
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number) => formatTooltipValue(value)}
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#fb7185"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#fb7185', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#fb7185', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
