'use client';

// ============================================================
// FeeCollectionChart — Area chart showing monthly fee collection trend
// Emerald fill with gold accent line
// ============================================================

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/** Monthly fee data point */
export interface MonthlyFeeData {
  month: string;
  collected: number;
  outstanding: number;
}

export interface FeeCollectionChartProps {
  /** Monthly fee data */
  data?: MonthlyFeeData[];
  /** Loading state */
  loading?: boolean;
}

/** Custom tooltip formatter */
function formatTooltipValue(value: number) {
  return `₨ ${value.toLocaleString()}`;
}

/**
 * FeeCollectionChart displays an area chart of monthly fee collection
 * with emerald fill and gold accent line for outstanding amounts.
 */
export default function FeeCollectionChart({
  data,
  loading = false,
}: FeeCollectionChartProps) {
  const chartData = data || [];

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Fee Collection Trend</CardTitle>
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
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Fee Collection Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <p className="text-sm text-muted-foreground">No data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="collected"
                  name="Collected"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#emeraldGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="outstanding"
                  name="Outstanding"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#amberGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
