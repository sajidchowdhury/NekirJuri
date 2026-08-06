'use client';

// ============================================================
// LedgerView — Account ledger view with running balance
// Header, date range filter, transaction table, totals
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Printer, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  type Account,
  type AccountType,
  formatTaka,
  generateLedger,
  calculateAccountBalance,
  accountTypeColors,
} from '@/lib/accounting/sample-data';

export interface LedgerViewProps {
  /** The account to show the ledger for */
  account: Account;
  /** Additional CSS classes */
  className?: string;
}

type DateRange = 'this-month' | 'this-quarter' | 'this-year' | 'all';

export default function LedgerView({ account, className }: LedgerViewProps) {
  const [dateRange, setDateRange] = React.useState<DateRange>('all');
  const colors = accountTypeColors[account.type];
  const currentBalance = calculateAccountBalance(account.id);
  const allRows = generateLedger(account.id);

  // Filter rows by date range
  const filteredRows = React.useMemo(() => {
    if (dateRange === 'all') return allRows;

    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'this-quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return allRows;
    }

    // Always include opening balance row
    const openingRow = allRows[0];
    const filtered = allRows.filter((row) => {
      if (row.description === 'Opening Balance') return true;
      return new Date(row.date) >= startDate;
    });
    return filtered.length > 0 ? filtered : [openingRow];
  }, [allRows, dateRange]);

  // Calculate totals
  const totalDebit = filteredRows.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = filteredRows.reduce((sum, row) => sum + row.credit, 0);
  const closingBalance = filteredRows[filteredRows.length - 1]?.balance ?? 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('space-y-4', className)}
    >
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">{account.code}</span>
                  {account.name}
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={cn('mt-1 h-5 text-[10px] px-1.5', colors.bg, colors.text)}
                >
                  {account.type}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {formatTaka(currentBalance)}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Date range filter */}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
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

          {/* Ledger Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-28">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-28">Debit (৳)</TableHead>
                  <TableHead className="text-right w-28">Credit (৳)</TableHead>
                  <TableHead className="text-right w-32">Balance (৳)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row, idx) => (
                  <TableRow
                    key={idx}
                    className={cn(
                      row.description === 'Opening Balance' && 'bg-muted/20 italic'
                    )}
                  >
                    <TableCell className="text-xs font-mono">
                      {formatDate(row.date)}
                    </TableCell>
                    <TableCell className="text-xs">{row.description}</TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {row.debit > 0 ? formatTaka(row.debit) : '—'}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-emerald-600 dark:text-emerald-400">
                      {row.credit > 0 ? formatTaka(row.credit) : '—'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right text-xs font-mono font-medium',
                        row.balance !== 0
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatTaka(row.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30 border border-border">
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
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Closing Balance</p>
              <p className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                {formatTaka(closingBalance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
