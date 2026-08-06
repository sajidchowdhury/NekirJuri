'use client';

// ============================================================
// TrialBalance — Trial Balance report
// Account Code, Name, Debit Total, Credit Total
// Only non-zero accounts, totals must balance
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Printer, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FinancialReportShell from '@/components/accounting/financial-report-shell';
import {
  chartOfAccounts,
  getAccountTotals,
  calculateAccountBalance,
  formatTaka,
  getLeafAccounts,
  type Account,
} from '@/lib/accounting/sample-data';

export interface TrialBalanceProps {
  /** Additional CSS classes */
  className?: string;
}

export default function TrialBalance({ className }: TrialBalanceProps) {
  const [asOfDate, setAsOfDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );

  // Build trial balance rows — only leaf accounts with non-zero balances
  const trialRows = React.useMemo(() => {
    const leaves = getLeafAccounts();
    return leaves
      .map((account) => {
        const balance = calculateAccountBalance(account.id);
        const { totalDebit, totalCredit } = getAccountTotals(account.id);

        // For Assets/Expenses: debit balance; for Liabilities/Income/Equity: credit balance
        const debitTotal = account.type === 'Asset' || account.type === 'Expense'
          ? Math.max(balance, 0)
          : 0;
        const creditTotal = account.type === 'Liability' || account.type === 'Income' || account.type === 'Equity'
          ? Math.max(balance, 0)
          : 0;

        // If account has both debit and credit activity, use the activity totals
        const dr = totalDebit > 0 || totalCredit > 0
          ? (account.type === 'Asset' || account.type === 'Expense' ? Math.max(balance, 0) : 0)
          : (balance > 0 && (account.type === 'Asset' || account.type === 'Expense') ? balance : 0);
        const cr = totalDebit > 0 || totalCredit > 0
          ? (account.type === 'Liability' || account.type === 'Income' || account.type === 'Equity' ? Math.max(balance, 0) : 0)
          : (balance > 0 && (account.type === 'Liability' || account.type === 'Income' || account.type === 'Equity') ? balance : 0);

        return {
          account,
          debit: dr,
          credit: cr,
        };
      })
      .filter((row) => row.debit !== 0 || row.credit !== 0);
  }, []);

  const totalDebit = trialRows.reduce((s, r) => s + r.debit, 0);
  const totalCredit = trialRows.reduce((s, r) => s + r.credit, 0);
  const isBalanced = totalDebit === totalCredit;

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

      <FinancialReportShell title="Trial Balance" dateLabel={dateLabel}>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-20">Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead className="text-right w-36">Debit (৳)</TableHead>
                <TableHead className="text-right w-36">Credit (৳)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trialRows.map((row) => (
                <TableRow key={row.account.id}>
                  <TableCell className="font-mono text-xs">{row.account.code}</TableCell>
                  <TableCell className="text-xs">{row.account.name}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {row.debit > 0 ? formatTaka(row.debit) : '—'}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    {row.credit > 0 ? formatTaka(row.credit) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Total Debit</p>
              <p className="text-sm font-bold font-mono">{formatTaka(totalDebit)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Credit</p>
              <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatTaka(totalCredit)}
              </p>
            </div>
          </div>
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
      </FinancialReportShell>
    </motion.div>
  );
}
