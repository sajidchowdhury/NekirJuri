'use client'

// ============================================================
// SimplifiedChartOfAccounts — Simple list view for Income & Expense
// CR-8: Simplified Accounting Mode
// No double-entry hierarchy, just Income and Expense categories
// ============================================================

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, TrendingUp, TrendingDown, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  chartOfAccounts,
  calculateAccountBalance,
  type Account,
  type AccountType,
} from '@/lib/accounting/sample-data'

export interface SimplifiedChartOfAccountsProps {
  onAddAccount?: (type?: AccountType) => void
  onEditAccount?: (account: Account) => void
}

export default function SimplifiedChartOfAccounts({
  onAddAccount,
  onEditAccount,
}: SimplifiedChartOfAccountsProps) {
  const t = useTranslations('accounting')

  // In simplified mode, only show Income and Expense leaf accounts
  const incomeLeafAccounts = chartOfAccounts.filter(
    (a) => a.type === 'Income' && a.parentId !== null
  )
  const expenseLeafAccounts = chartOfAccounts.filter(
    (a) => a.type === 'Expense' && a.parentId !== null
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Accounts */}
      <Card className="border-emerald-200 dark:border-emerald-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {t('incomeAccounts')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              onClick={() => onAddAccount?.('Income')}
            >
              <Plus className="h-3 w-3" />
              {t('addIncomeAccount')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <AnimatePresence>
              {incomeLeafAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-12">{account.code}</span>
                    <span className="text-sm">{account.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      ৳{calculateAccountBalance(account.id).toLocaleString('en-IN')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditAccount?.(account)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Expense Accounts */}
      <Card className="border-rose-200 dark:border-rose-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              {t('expenseAccounts')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1 border-rose-300 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              onClick={() => onAddAccount?.('Expense')}
            >
              <Plus className="h-3 w-3" />
              {t('addExpenseAccount')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <AnimatePresence>
              {expenseLeafAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground w-12">{account.code}</span>
                    <span className="text-sm">{account.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
                      ৳{calculateAccountBalance(account.id).toLocaleString('en-IN')}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onEditAccount?.(account)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
