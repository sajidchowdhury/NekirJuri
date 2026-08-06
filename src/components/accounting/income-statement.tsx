'use client';

// ============================================================
// IncomeStatement — Income Statement (Profit & Loss)
// Income section, Expenses section, Net Income
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FinancialReportShell from '@/components/accounting/financial-report-shell';
import {
  chartOfAccounts,
  calculateAccountBalance,
  getChildAccounts,
  formatTaka,
  type AccountType,
} from '@/lib/accounting/sample-data';

export interface IncomeStatementProps {
  className?: string;
}

type DateRange = 'this-month' | 'this-quarter' | 'this-year' | 'all';

export default function IncomeStatement({ className }: IncomeStatementProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>('this-year');

  // Get all Income accounts (leaf accounts only)
  const incomeAccounts = React.useMemo(() => {
    const allIncome = chartOfAccounts.filter((a) => a.type === 'Income');
    // Get leaf accounts only
    const parentIds = new Set(allIncome.filter((a) => a.parentId === null).map((a) => a.id));
    return allIncome
      .filter((a) => a.parentId !== null || !allIncome.some((c) => c.parentId === a.id))
      .map((a) => ({
        account: a,
        balance: calculateAccountBalance(a.id),
      }))
      .filter((r) => r.balance !== 0);
  }, []);

  // Get all Expense accounts (leaf accounts only)
  const expenseAccounts = React.useMemo(() => {
    const allExpense = chartOfAccounts.filter((a) => a.type === 'Expense');
    return allExpense
      .filter((a) => a.parentId !== null || !allExpense.some((c) => c.parentId === a.id))
      .map((a) => ({
        account: a,
        balance: calculateAccountBalance(a.id),
      }))
      .filter((r) => r.balance !== 0);
  }, []);

  const totalIncome = incomeAccounts.reduce((s, r) => s + r.balance, 0);
  const totalExpenses = expenseAccounts.reduce((s, r) => s + r.balance, 0);
  const netIncome = totalIncome - totalExpenses;

  const dateRangeLabels: Record<DateRange, string> = {
    'this-month': 'This Month',
    'this-quarter': 'This Quarter',
    'this-year': 'This Year (2025)',
    'all': 'All Time',
  };

  const dateLabel = `Period: ${dateRangeLabels[dateRange]}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => window.print()}
        >
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
      </div>

      <FinancialReportShell title="Income Statement" dateLabel={dateLabel}>
        {/* Income Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">
            Income
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Account</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2 w-36">Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {incomeAccounts.map((row) => (
                  <tr key={row.account.id} className="border-t border-border">
                    <td className="px-3 py-2 text-xs">
                      <span className="font-mono mr-2 text-muted-foreground">{row.account.code}</span>
                      {row.account.name}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                      {formatTaka(row.balance)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                  <td className="px-3 py-2 text-xs font-semibold">Total Income</td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatTaka(totalIncome)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-2 uppercase tracking-wide">
            Expenses
          </h4>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-2">Account</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-2 w-36">Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {expenseAccounts.map((row) => (
                  <tr key={row.account.id} className="border-t border-border">
                    <td className="px-3 py-2 text-xs">
                      <span className="font-mono mr-2 text-muted-foreground">{row.account.code}</span>
                      {row.account.name}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-rose-600 dark:text-rose-400">
                      {formatTaka(row.balance)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-900/10">
                  <td className="px-3 py-2 text-xs font-semibold">Total Expenses</td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-bold text-rose-600 dark:text-rose-400">
                    {formatTaka(totalExpenses)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net Income */}
        <div className={cn(
          'p-4 rounded-lg border-2',
          netIncome >= 0
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10'
            : 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-900/10'
        )}>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">
              {netIncome >= 0 ? 'Net Income' : 'Net Loss'}
            </span>
            <span className={cn(
              'text-xl font-bold font-mono',
              netIncome >= 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-rose-600 dark:text-rose-400'
            )}>
              {formatTaka(Math.abs(netIncome))}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total Income ({formatTaka(totalIncome)}) − Total Expenses ({formatTaka(totalExpenses)})
          </p>
        </div>
      </FinancialReportShell>
    </motion.div>
  );
}
