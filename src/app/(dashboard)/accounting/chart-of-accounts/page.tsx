'use client';

// ============================================================
// Chart of Accounts Page — Mode-aware
// CR-8: Simplified Accounting Mode
// Double-entry: Full tree + Ledger + Reports
// Simplified: Income/Expense lists only
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, BookOpen, ScrollText, BarChart3, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ChartOfAccountsTree from '@/components/accounting/chart-of-accounts-tree';
import AccountForm from '@/components/accounting/account-form';
import LedgerView from '@/components/accounting/ledger-view';
import TrialBalance from '@/components/accounting/trial-balance';
import IncomeStatement from '@/components/accounting/income-statement';
import BalanceSheet from '@/components/accounting/balance-sheet';
import SimplifiedChartOfAccounts from '@/components/accounting/simplified-chart-of-accounts';
import SimplifiedAccountingSummary from '@/components/accounting/simplified-accounting-summary';
import { useAccountingMode } from '@/hooks/use-accounting-mode';
import {
  chartOfAccounts,
  type Account,
  type AccountType,
} from '@/lib/accounting/sample-data';
import { slideUp } from '@/lib/animations';

export default function ChartOfAccountsPage() {
  const t = useTranslations('accounting');
  const { isSimplified, loading } = useAccountingMode();

  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);
  const [selectedAccountType, setSelectedAccountType] = React.useState<AccountType | undefined>();
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
  const [ledgerDialogOpen, setLedgerDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chart');

  const handleViewLedger = (account: Account) => {
    setSelectedAccount(account);
    setLedgerDialogOpen(true);
  };

  const handleAddAccount = (type?: AccountType) => {
    setSelectedAccountType(type);
    setAccountDialogOpen(true);
  };

  const handleAccountSubmit = (values: Record<string, unknown>) => {
    console.log('Account created:', values);
    setAccountDialogOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-muted-foreground">Loading...</p></div>;
  }

  // ── Simplified Mode ──
  if (isSimplified) {
    return (
      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-6"
      >
        <PageHeader
          title={t('chartOfAccounts')}
          description={t('simplifiedModeDescription')}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                <Settings2 className="h-3 w-3 mr-1" />
                {t('simplifiedMode')}
              </Badge>
              <ExportButton />
            </div>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="chart" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {t('accounts')}
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              {t('summary')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <SimplifiedChartOfAccounts
              onAddAccount={handleAddAccount}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-4">
            <SimplifiedAccountingSummary />
          </TabsContent>
        </Tabs>

        {/* Add Account Dialog */}
        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('addNewAccount')}</DialogTitle>
              <DialogDescription>{t('createNewAccount')}</DialogDescription>
            </DialogHeader>
            <AccountForm
              defaultType={selectedAccountType}
              onSubmit={handleAccountSubmit}
              onCancel={() => setAccountDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // ── Double-Entry Mode (Original) ──
  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <PageHeader
        title={t('chartOfAccounts')}
        description={t('doubleEntryModeDescription')}
        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              size="sm"
              onClick={() => handleAddAccount()}
            >
              <Plus className="h-4 w-4" />
              {t('addAccount')}
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="chart" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {t('chartOfAccounts')}
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-1.5">
            <ScrollText className="h-3.5 w-3.5" />
            {t('ledger')}
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            {t('reports')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4">
          <ChartOfAccountsTree
            onViewLedger={handleViewLedger}
            onAddAccount={handleAddAccount}
          />
        </TabsContent>

        <TabsContent value="ledger" className="mt-4">
          {selectedAccount ? (
            <LedViewWrapper account={selectedAccount} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScrollText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t('selectAccount')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('selectAccountHint')}</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveTab('chart')}>
                {t('goToChartOfAccounts')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Accordion type="single" collapsible defaultValue="trial-balance" className="space-y-3">
            <AccordionItem value="trial-balance" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/30">
                <span className="font-semibold text-sm">{t('trialBalance')}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TrialBalance />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="income-statement" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/30">
                <span className="font-semibold text-sm">{t('incomeStatement')}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <IncomeStatement />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="balance-sheet" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/30">
                <span className="font-semibold text-sm">{t('balanceSheet')}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <BalanceSheet />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('addNewAccount')}</DialogTitle>
            <DialogDescription>{t('createNewAccount')}</DialogDescription>
          </DialogHeader>
          <AccountForm
            defaultType={selectedAccountType}
            onSubmit={handleAccountSubmit}
            onCancel={() => setAccountDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('accountLedger')}</DialogTitle>
            <DialogDescription>
              {selectedAccount ? `${selectedAccount.code} — ${selectedAccount.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && <LedgerView account={selectedAccount} />}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function LedViewWrapper({ account }: { account: Account }) {
  return <LedgerView account={account} />;
}
