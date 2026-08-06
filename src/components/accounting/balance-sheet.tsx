'use client';

// ============================================================
// BalanceSheet — Balance Sheet report
// Assets, Liabilities, Equity sections
// Total L+E must equal Total Assets
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Printer, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import FinancialReportShell from '@/components/accounting/financial-report-shell';
import {
  chartOfAccounts,
  calculateAccountBalance,
  formatTaka,
} from '@/lib/accounting/sample-data';

export interface BalanceSheetProps {
  className?: string;
}

/** Section component for Balance Sheet groups */
function BsSection({
  title,
  colorClass,
  items,
  subtotal,
}: {
  title: string;
  colorClass: string;
  items: { code: string; name: string; balance: number }[];
  subtotal: number;
}) {
  return (
    <div className="mb-5">
      <h4 className={cn('text-sm font-semibold mb-2 uppercase tracking-wide', colorClass)}>
        {title}
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
            {items.map((item) => (
              <tr key={item.code} className="border-t border-border">
                <td className="px-3 py-2 text-xs">
                  <span className="font-mono mr-2 text-muted-foreground">{item.code}</span>
                  {item.name}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {formatTaka(item.balance)}
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-border bg-muted/20">
              <td className="px-3 py-2 text-xs font-semibold">Subtotal</td>
              <td className="px-3 py-2 text-right font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                {formatTaka(subtotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BalanceSheet({ className }: BalanceSheetProps) {
  const [asOfDate, setAsOfDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );

  // === ASSETS ===
  const currentAssets = chartOfAccounts.filter((a) => a.parentId === 'acc-1000');
  const fixedAssets = chartOfAccounts.filter((a) => a.parentId === 'acc-1100');
  const currentAssetsTotal = currentAssets.reduce((s, a) => s + calculateAccountBalance(a.id), 0);
  const fixedAssetsTotal = fixedAssets.reduce((s, a) => s + calculateAccountBalance(a.id), 0);
  const totalAssets = currentAssetsTotal + fixedAssetsTotal;

  // === LIABILITIES ===
  const currentLiabilities = chartOfAccounts.filter((a) => a.parentId === 'acc-2000');
  const longTermLiabilities = chartOfAccounts.filter((a) => a.parentId === 'acc-2100');
  const currentLiabTotal = currentLiabilities.reduce((s, a) => s + calculateAccountBalance(a.id), 0);
  const longTermLiabTotal = longTermLiabilities.reduce((s, a) => s + calculateAccountBalance(a.id), 0);
  const totalLiabilities = currentLiabTotal + longTermLiabTotal;

  // === EQUITY ===
  const retainedEarnings = calculateAccountBalance('acc-5000');
  const surplusFund = calculateAccountBalance('acc-5100');
  const totalEquity = retainedEarnings + surplusFund;

  const totalLiabEquity = totalLiabilities + totalEquity;
  const isBalanced = totalAssets === totalLiabEquity;

  const dateLabel = `As of: ${new Date(asOfDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`;

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
          <label className="text-xs text-muted-foreground">As of:</label>
          <Input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="h-8 w-40 text-xs"
          />
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

      <FinancialReportShell title="Balance Sheet" dateLabel={dateLabel}>
        {/* Assets */}
        <BsSection
          title="Assets"
          colorClass="text-sky-700 dark:text-sky-400"
          items={currentAssets.map((a) => ({
            code: a.code,
            name: a.name,
            balance: calculateAccountBalance(a.id),
          }))}
          subtotal={currentAssetsTotal}
        />
        <BsSection
          title="Fixed Assets"
          colorClass="text-sky-700 dark:text-sky-400"
          items={fixedAssets.map((a) => ({
            code: a.code,
            name: a.name,
            balance: calculateAccountBalance(a.id),
          }))}
          subtotal={fixedAssetsTotal}
        />

        {/* Total Assets */}
        <div className="p-3 rounded-lg bg-sky-50/50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Total Assets</span>
            <span className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400">
              {formatTaka(totalAssets)}
            </span>
          </div>
        </div>

        {/* Li< Liabilities */}
        <BsSection
          title="Current Liabilities"
          colorClass="text-amber-700 dark:text-amber-400"
          items={currentLiabilities.map((a) => ({
            code: a.code,
            name: a.name,
            balance: calculateAccountBalance(a.id),
          }))}
          subtotal={currentLiabTotal}
        />
        <BsSection
          title="Long-term Liabilities"
          colorClass="text-amber-700 dark:text-amber-400"
          items={longTermLiabilities.map((a) => ({
            code: a.code,
            name: a.name,
            balance: calculateAccountBalance(a.id),
          }))}
          subtotal={longTermLiabTotal}
        />

        {/* Total Liabilities */}
        <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Total Liabilities</span>
            <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatTaka(totalLiabilities)}
            </span>
          </div>
        </div>

        {/* Equity */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-400 mb-2 uppercase tracking-wide">
            Equity
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
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-xs">
                    <span className="font-mono mr-2 text-muted-foreground">5000</span>
                    Retained Earnings
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatTaka(retainedEarnings)}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 text-xs">
                    <span className="font-mono mr-2 text-muted-foreground">5100</span>
                    Surplus Fund
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    {formatTaka(surplusFund)}
                  </td>
                </tr>
                <tr className="border-t-2 border-border bg-muted/20">
                  <td className="px-3 py-2 text-xs font-semibold">Total Equity</td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-bold text-violet-600 dark:text-violet-400">
                    {formatTaka(totalEquity)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Liabilities + Equity */}
        <div className="p-4 rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">Total Liabilities + Equity</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatTaka(totalLiabEquity)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Assets: {formatTaka(totalAssets)} | L+E: {formatTaka(totalLiabEquity)}
            </span>
            {isBalanced ? (
              <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Balanced
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                ✗ Unbalanced
              </Badge>
            )}
          </div>
        </div>
      </FinancialReportShell>
    </motion.div>
  );
}
