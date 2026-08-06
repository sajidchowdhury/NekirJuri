'use client';

// ============================================================
// PayrollDashboard — Stats, payroll trend chart, department breakdown
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Banknote,
  Users,
  Calculator,
  Building2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/molecules/stat-card';
import {
  formatTaka,
  getPayrollSummary,
  payrollTrend,
  departmentBreakdown,
} from '@/lib/payroll/sample-data';
import { staggerChildren, fadeIn } from '@/lib/animations';

const deptColorMap: Record<string, string> = {
  emerald: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  amber: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
  sky: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20',
  violet: 'border-violet-500 bg-violet-50 dark:bg-violet-900/20',
  rose: 'border-rose-500 bg-rose-50 dark:bg-rose-900/20',
};

const deptIconColor: Record<string, string> = {
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  sky: 'text-sky-600 dark:text-sky-400',
  violet: 'text-violet-600 dark:text-violet-400',
  rose: 'text-rose-600 dark:text-rose-400',
};

export default function PayrollDashboard() {
  const summary = React.useMemo(() => getPayrollSummary(), []);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Payroll This Month"
          value={formatTaka(summary.totalPayroll)}
          icon={Banknote}
          variant="emerald"
          trend={{ value: 3.2, label: 'vs last month' }}
        />
        <StatCard
          title="Paid vs Pending"
          value={`${summary.paidCount}/${summary.totalCount} paid`}
          icon={Users}
          variant="gold"
          trend={{ value: 8, label: 'collection rate' }}
        />
        <StatCard
          title="Average Salary"
          value={formatTaka(summary.avgSalary)}
          icon={Calculator}
          variant="default"
        />
        <StatCard
          title="Departments"
          value={String(summary.departments)}
          icon={Building2}
          variant="rose"
        />
      </motion.div>

      {/* Payroll Trend Chart */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Payroll Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={payrollTrend}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v: number) => `৳${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatTaka(value),
                      name === 'total' ? 'Total Payroll' : 'Total Deductions',
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    formatter={(value: string) =>
                      value === 'total' ? 'Total Payroll' : 'Deductions'
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#047857"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#047857' }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deductions"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#e11d48' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Department Breakdown */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Department Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {departmentBreakdown.map((dept) => (
            <Card
              key={dept.department}
              className={`border-l-[3px] ${deptColorMap[dept.color]}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2
                    className={`h-4 w-4 ${deptIconColor[dept.color]}`}
                  />
                  <span className="text-sm font-medium">{dept.department}</span>
                </div>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {formatTaka(dept.totalNet)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dept.employeeCount} employee{dept.employeeCount > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
