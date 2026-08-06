'use client';

// ============================================================
// ExpenseDashboard — Stats, category pie chart, budget vs actual
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  ReceiptText, TrendingUp, TrendingDown, PieChart, ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import StatCard from '@/components/molecules/stat-card';
import {
  sampleExpenses,
  sampleBudgetAllocations,
  formatTaka,
  type ExpenseCategory,
} from '@/lib/finance/sample-data';

const categoryColors: Record<ExpenseCategory, string> = {
  utilities: '#0284c7',
  maintenance: '#d97706',
  stationery: '#7c3aed',
  food: '#059669',
  transport: '#e11d48',
  salary: '#475569',
  misc: '#9ca3af',
};

const categoryLabels: Record<ExpenseCategory, string> = {
  utilities: 'Utilities',
  maintenance: 'Maintenance',
  stationery: 'Stationery',
  food: 'Food',
  transport: 'Transport',
  salary: 'Salary',
  misc: 'Misc',
};

export default function ExpenseDashboard() {
  // This month (Feb 2025)
  const thisMonthExpenses = sampleExpenses.filter((e) => e.date.startsWith('2025-02'));
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Last month (Jan 2025)
  const lastMonthExpenses = sampleExpenses.filter((e) => e.date.startsWith('2025-01'));
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const trendPercent = lastMonthTotal > 0
    ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
    : 0;

  // Budget used %
  const totalBudget = sampleBudgetAllocations.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = sampleBudgetAllocations.reduce((sum, b) => sum + b.spent, 0);
  const budgetUsedPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const numTransactions = thisMonthExpenses.length;

  // Pie chart data — group by category for this month
  const categoryTotals = (() => {
    const map = new Map<ExpenseCategory, number>();
    for (const exp of thisMonthExpenses) {
      map.set(exp.category, (map.get(exp.category) ?? 0) + exp.amount);
    }
    return Array.from(map.entries()).map(([category, amount]) => ({
      name: categoryLabels[category],
      value: amount,
      color: categoryColors[category],
    }));
  })();

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
          title="This Month Total"
          value={formatTaka(thisMonthTotal)}
          icon={ReceiptText}
          variant="emerald"
          trend={{ value: trendPercent, label: 'vs last month' }}
        />
        <StatCard
          title="Last Month"
          value={formatTaka(lastMonthTotal)}
          icon={TrendingDown}
          variant="gold"
        />
        <StatCard
          title="Budget Used"
          value={`${budgetUsedPercent}%`}
          icon={PieChart}
          variant={budgetUsedPercent > 100 ? 'rose' : 'default'}
          trend={{ value: budgetUsedPercent - 100, label: budgetUsedPercent > 100 ? 'over budget' : 'within budget' }}
        />
        <StatCard
          title="Transactions"
          value={numTransactions.toString()}
          icon={ListChecks}
          variant="default"
        />
      </div>

      {/* Pie Chart + Budget Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryTotals}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryTotals.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatTaka(value), 'Amount']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    {formatTaka(thisMonthTotal)}
                  </p>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryTotals.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget vs Actual */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sampleBudgetAllocations.map((item, idx) => {
              const percent = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
              const isOverBudget = item.spent > item.budget;
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColors[item.category] }}
                      />
                      <p className="text-sm font-medium">{categoryLabels[item.category]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTaka(item.spent)} / {formatTaka(item.budget)}
                      </span>
                      {isOverBudget && (
                        <TrendingUp className="h-3 w-3 text-rose-500" />
                      )}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: isOverBudget ? '#e11d48' : '#059669',
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {percent}% {isOverBudget ? '(over budget)' : ''}
                  </p>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
