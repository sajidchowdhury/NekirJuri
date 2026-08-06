'use client';

// ============================================================
// StudentDistributionChart — Donut pie chart showing students by class
// Color palette: emerald, gold, sky, rose, violet
// ============================================================

import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/** Student distribution data point */
export interface StudentDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface StudentDistributionChartProps {
  /** Distribution data */
  data?: StudentDistributionData[];
  /** Loading state */
  loading?: boolean;
}

/** Sample data used when no real data is available */
const sampleData: StudentDistributionData[] = [
  { name: 'Class 1-5', value: 450, color: '#10b981' },
  { name: 'Class 6-8', value: 380, color: '#f59e0b' },
  { name: 'Class 9-10', value: 280, color: '#0ea5e9' },
  { name: 'Hifz', value: 140, color: '#fb7185' },
];

/**
 * StudentDistributionChart displays a donut pie chart showing
 * the distribution of students across different class groups.
 */
export default function StudentDistributionChart({
  data,
  loading = false,
}: StudentDistributionChartProps) {
  const chartData = data && data.length > 0 ? data : sampleData;
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Student Distribution</CardTitle>
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
          <CardTitle className="text-base">Student Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                strokeWidth={2}
                stroke="var(--color-background)"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              {/* Center label */}
              <text
                x="50%"
                y="40%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-2xl font-bold"
              >
                {total.toLocaleString()}
              </text>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground text-xs"
              >
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
