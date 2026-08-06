'use client';

// ============================================================
// ChartOfAccountsTree — Hierarchical tree view of accounts
// Collapsible sections by type, parent/child hierarchy,
// click-to-view-ledger, type color badges, balance display
// ============================================================

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Eye,
  Wallet,
  Building2,
  TrendingUp,
  TrendingDown,
  Scale,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  chartOfAccounts,
  accountTypeColors,
  accountTypeLabels,
  formatTaka,
  calculateAccountBalance,
  getTopLevelAccounts,
  getChildAccounts,
  type Account,
  type AccountType,
} from '@/lib/accounting/sample-data';

export interface ChartOfAccountsTreeProps {
  /** Callback when an account is clicked to view ledger */
  onViewLedger: (account: Account) => void;
  /** Callback when "Add Account" is clicked for a type */
  onAddAccount?: (type?: AccountType) => void;
  /** Additional CSS classes */
  className?: string;
}

const typeIcons: Record<AccountType, React.ElementType> = {
  Asset: Wallet,
  Liability: Building2,
  Income: TrendingUp,
  Expense: TrendingDown,
  Equity: Scale,
};

const typeOrder: AccountType[] = ['Asset', 'Liability', 'Income', 'Expense', 'Equity'];

function AccountRow({
  account,
  level,
  onViewLedger,
}: {
  account: Account;
  level: number;
  onViewLedger: (account: Account) => void;
}) {
  const [expanded, setExpanded] = React.useState(true);
  const children = getChildAccounts(account.id);
  const hasChildren = children.length > 0;
  const currentBalance = calculateAccountBalance(account.id);
  const colors = accountTypeColors[account.type];

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-md transition-colors',
          'hover:bg-muted/50 cursor-pointer group',
          level > 0 && 'ml-6'
        )}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          else onViewLedger(account);
        }}
      >
        {/* Expand/Collapse arrow */}
        {hasChildren ? (
          <button
            className="shrink-0 h-4 w-4 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="shrink-0 h-4 w-4" />
        )}

        {/* Account code */}
        <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
          {account.code}
        </span>

        {/* Account name */}
        <span
          className={cn(
            'flex-1 text-sm truncate',
            hasChildren ? 'font-semibold text-foreground' : 'text-foreground/80'
          )}
        >
          {account.name}
        </span>

        {/* Type badge — only for leaf accounts at deeper levels */}
        {!hasChildren && level > 0 && (
          <Badge
            variant="secondary"
            className={cn(
              'h-5 text-[10px] px-1.5 shrink-0',
              colors.bg,
              colors.text
            )}
          >
            {account.type}
          </Badge>
        )}

        {/* Opening Balance */}
        <span className="text-xs text-muted-foreground w-24 text-right shrink-0 hidden sm:block">
          {formatTaka(account.openingBalance)}
        </span>

        {/* Current Balance */}
        <span
          className={cn(
            'text-xs font-medium w-28 text-right shrink-0',
            currentBalance !== 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
          )}
        >
          {formatTaka(currentBalance)}
        </span>

        {/* View ledger button (leaf accounts) */}
        {!hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onViewLedger(account);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children.map((child) => (
              <AccountRow
                key={child.id}
                account={child}
                level={level + 1}
                onViewLedger={onViewLedger}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChartOfAccountsTree({
  onViewLedger,
  onAddAccount,
  className,
}: ChartOfAccountsTreeProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Accordion type="multiple" defaultValue={typeOrder}>
        {typeOrder.map((type) => {
          const Icon = typeIcons[type];
          const topLevelAccounts = getTopLevelAccounts(type);
          const colors = accountTypeColors[type];
          const typeTotal = topLevelAccounts.reduce((sum, acc) => {
            return sum + calculateAccountBalance(acc.id);
          }, 0);

          return (
            <AccordionItem key={type} value={type} className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger
                className={cn(
                  'px-4 py-3 hover:bg-muted/30 transition-colors',
                  'data-[state=open]:bg-muted/20'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      colors.bg
                    )}
                  >
                    <Icon className={cn('h-4 w-4', colors.text)} />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-sm">{accountTypeLabels[type]}</span>
                    <p className="text-xs text-muted-foreground">
                      {topLevelAccounts.length} group{topLevelAccounts.length !== 1 ? 's' : ''} • Balance: {formatTaka(typeTotal)}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-3">
                {/* Column headers */}
                <div className="flex items-center gap-2 py-2 px-3 text-xs font-medium text-muted-foreground border-b border-border mb-1">
                  <span className="h-4 w-4 shrink-0" />
                  <span className="w-12 shrink-0">Code</span>
                  <span className="flex-1">Account Name</span>
                  <span className="w-24 text-right shrink-0 hidden sm:block">Opening</span>
                  <span className="w-28 text-right shrink-0">Current</span>
                  <span className="w-6 shrink-0" />
                </div>
                {topLevelAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    level={0}
                    onViewLedger={onViewLedger}
                  />
                ))}
                {onAddAccount && (
                  <div className="mt-2 px-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs w-full border-dashed"
                      onClick={() => onAddAccount(type)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add {type} Account
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
