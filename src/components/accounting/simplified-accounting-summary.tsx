'use client'

// ============================================================
// SimplifiedAccountingSummary — Income vs Expense dashboard
// CR-8: Simplified Accounting Mode
// Shows: Total Income, Total Expenses, Net Surplus/Deficit
// Plus: Recent entries and category breakdown
// ============================================================

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  chartOfAccounts,
  journalEntries,
  calculateAccountBalance,
  formatTaka,
} from '@/lib/accounting/sample-data'

export default function SimplifiedAccountingSummary() {
  const t = useTranslations('accounting')

  // Calculate totals from sample data
  const incomeAccounts = chartOfAccounts.filter((a) => a.type === 'Income' && a.parentId !== null)
  const expenseAccounts = chartOfAccounts.filter((a) => a.type === 'Expense' && a.parentId !== null)

  const totalIncome = incomeAccounts.reduce(
    (sum, acc) => sum + Math.max(0, calculateAccountBalance(acc.id)),
    0
  )
  const totalExpenses = expenseAccounts.reduce(
    (sum, acc) => sum + Math.max(0, calculateAccountBalance(acc.id)),
    0
  )
  const netSurplus = totalIncome - totalExpenses
  const isSurplus = netSurplus >= 0

  // Recent simplified entries (map from journal entries)
  const recentEntries = journalEntries
    .filter((e) => e.status === 'posted')
    .slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Income */}
        <Card className="border-emerald-200 dark:border-emerald-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('totalIncome')}
                </p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  {formatTaka(totalIncome)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="border-rose-200 dark:border-rose-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('totalExpenses')}
                </p>
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1">
                  {formatTaka(totalExpenses)}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Surplus/Deficit */}
        <Card className={isSurplus ? 'border-emerald-200 dark:border-emerald-800/50' : 'border-amber-200 dark:border-amber-800/50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {isSurplus ? t('netSurplus') : t('netDeficit')}
                </p>
                <p className={`text-2xl font-bold mt-1 ${isSurplus ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {isSurplus ? '' : '-'}{formatTaka(Math.abs(netSurplus))}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isSurplus ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                {isSurplus ? (
                  <ArrowUpRight className={`h-5 w-5 ${isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`} />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {t('incomeBreakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incomeAccounts.map((acc) => {
                const balance = Math.max(0, calculateAccountBalance(acc.id))
                const percentage = totalIncome > 0 ? (balance / totalIncome) * 100 : 0
                return (
                  <div key={acc.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{acc.name}</span>
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">{formatTaka(balance)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              {t('expenseBreakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expenseAccounts.map((acc) => {
                const balance = Math.max(0, calculateAccountBalance(acc.id))
                const percentage = totalExpenses > 0 ? (balance / totalExpenses) * 100 : 0
                return (
                  <div key={acc.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{acc.name}</span>
                      <span className="font-medium text-rose-700 dark:text-rose-400">{formatTaka(balance)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-rose-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t('recentEntries')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentEntries.map((entry) => {
              const isIncomeEntry = entry.lineItems.some((l) => l.credit > 0 && l.accountCode.startsWith('3'))
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isIncomeEntry ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                      {isIncomeEntry ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{entry.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        {entry.reference && ` • ${entry.reference}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${isIncomeEntry ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {isIncomeEntry ? '+' : '-'}{formatTaka(isIncomeEntry ? entry.lineItems.find((l) => l.credit > 0)?.credit || 0 : entry.lineItems.find((l) => l.debit > 0)?.debit || 0)}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
