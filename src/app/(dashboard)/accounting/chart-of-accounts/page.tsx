'use client';

// ============================================================
// Chart of Accounts Page — Mode-aware
// CR-8: Simplified Accounting Mode
// Double-entry: Full tree + Ledger + Reports
// Simplified: Income/Expense lists only
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
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
import { slideUp } from '@/lib/animations';
import { apiSubmit } from '@/lib/api-client';

// ── API Account type ─────────────────────────────────────
interface ApiAccount {
  id: number;
  code: string;
  name: string;
  accountType: string;
  parentId: number | null;
  openingBalance: number;
  currentBalance: number;
  description?: string | null;
  isActive: boolean;
  parent?: { id: number; code: string; name: string } | null;
  children?: { id: number; code: string; name: string; accountType: string }[];
}

type AccountType = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';

const mapAccountType = (type: string): AccountType => {
  const t = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  if (t === 'Asset' || t === 'Liability' || t === 'Income' || t === 'Expense' || t === 'Equity') return t as AccountType;
  return 'Asset';
};

export default function ChartOfAccountsPage() {
  const t = useTranslations('accounting');
  const { isSimplified, loading } = useAccountingMode();
  const queryClient = useQueryClient();

  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);
  const [selectedAccountType, setSelectedAccountType] = React.useState<AccountType | undefined>();
  const [selectedAccount, setSelectedAccount] = React.useState<ApiAccount | null>(null);
  const [ledgerDialogOpen, setLedgerDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chart');

  const handleViewLedger = (account: ApiAccount) => {
    setSelectedAccount(account);
    setLedgerDialogOpen(true);
  };

  const handleAddAccount = (type?: AccountType) => {
    setSelectedAccountType(type);
    setAccountDialogOpen(true);
  };

  const handleAccountSubmit = async (values: Record<string, unknown>) => {
    try {
      await apiSubmit('/api/accounts', 'POST', {
        code: values.code,
        name: values.name,
        accountType: values.accountType || values.type,
        parentId: values.parentId || null,
        openingBalance: values.openingBalance || 0,
        description: values.description || null,
      });
      toast.success('Account created successfully');
      setAccountDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account');
    }
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
          <div className="space-y-3">
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30">
                <span className="font-semibold text-sm">{t('trialBalance')}</span>
              </div>
              <div className="px-4 pb-4">
                <TrialBalance />
              </div>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30">
                <span className="font-semibold text-sm">{t('incomeStatement')}</span>
              </div>
              <div className="px-4 pb-4">
                <IncomeStatement />
              </div>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-muted/30">
                <span className="font-semibold text-sm">{t('balanceSheet')}</span>
              </div>
              <div className="px-4 pb-4">
                <BalanceSheet />
              </div>
            </div>
          </div>
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
          {selectedAccount && <LedgerView account={selectedAccount as never} />}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function LedViewWrapper({ account }: { account: ApiAccount }) {
  return <LedgerView account={account as never} />;
}
