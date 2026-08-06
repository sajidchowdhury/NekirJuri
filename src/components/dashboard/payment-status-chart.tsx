'use client';

// ============================================================
// PaymentStatusChart — Stacked bar chart showing paid vs partial vs unpaid
// Emerald for paid, amber for partial, rose for unpaid
// ============================================================

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/** Payment status data point */
export interface PaymentStatusData {
  month: string;
  paid: number;
  partial: number;
  unpaid: number;
}

export interface PaymentStatusChartProps {
  /** Payment status data */
  data?: PaymentStatusData[];
  /** Loading state */
  loading?: boolean;
}

/** Sample data used when no real data is available */
const sampleData: PaymentStatusData[] = [
  { month: 'Mar', paid: 38000, partial: 7000, unpaid: 12000 },
  { month: 'Apr', paid: 44000, partial: 8000, unpaid: 8000 },
  { month: 'May', paid: 40000, partial: 5000, unpaid: 15000 },
  { month: 'Jun', paid: 52000, partial: 9000, unpaid: 9000 },
  { month: 'Jul', paid: 47000, partial: 6000, unpaid: 11000 },
  { month: 'Aug', paid: 58000, partial: 9000, unpaid: 7000 },
];

/** Custom tooltip formatter */
function formatTooltipValue(value: number) {
  return `₨ ${value.toLocaleString()}`;
}

/**
 * PaymentStatusChart displays a stacked bar chart showing
 * paid, partial, and unpaid payment amounts by month.
 */
export default function PaymentStatusChart({
  data,
  loading = false,
}: PaymentStatusChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData;

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Payment Status</CardTitle>
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
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
    >
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
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
              <Bar dataKey="paid" name="Paid" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="partial" name="Partial" stackId="a" fill="#f59e0b" />
              <Bar dataKey="unpaid" name="Unpaid" stackId="a" fill="#fb7185" radius={[0, 0, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
