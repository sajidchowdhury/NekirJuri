'use client';

// ============================================================
// Chart of Accounts Page
// Three tabs: Chart of Accounts, Ledger, Reports
// Bismillah, PageHeader, ExportButton, Framer Motion
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, ScrollText, BarChart3 } from 'lucide-react';
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
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ChartOfAccountsTree from '@/components/accounting/chart-of-accounts-tree';
import AccountForm from '@/components/accounting/account-form';
import LedgerView from '@/components/accounting/ledger-view';
import TrialBalance from '@/components/accounting/trial-balance';
import IncomeStatement from '@/components/accounting/income-statement';
import BalanceSheet from '@/components/accounting/balance-sheet';
import {
  chartOfAccounts,
  type Account,
  type AccountType,
} from '@/lib/accounting/sample-data';
import { slideUp } from '@/lib/animations';

export default function ChartOfAccountsPage() {
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);
  const [selectedAccountType, setSelectedAccountType] = React.useState<AccountType | undefined>();
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);
  const [ledgerDialogOpen, setLedgerDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('chart');

  // Handle account click → view ledger
  const handleViewLedger = (account: Account) => {
    setSelectedAccount(account);
    setLedgerDialogOpen(true);
  };

  // Handle add account
  const handleAddAccount = (type?: AccountType) => {
    setSelectedAccountType(type);
    setAccountDialogOpen(true);
  };

  // Handle account form submit
  const handleAccountSubmit = (values: Record<string, unknown>) => {
    // In a real app, this would call an API
    console.log('Account created:', values);
    setAccountDialogOpen(false);
  };

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-6"
    >
      <PageHeader
        title="Chart of Accounts"
        description="Manage accounting ledger and account hierarchy"

        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              size="sm"
              onClick={() => handleAddAccount()}
            >
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="chart" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-1.5">
            <ScrollText className="h-3.5 w-3.5" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Chart of Accounts Tab */}
        <TabsContent value="chart" className="mt-4">
          <ChartOfAccountsTree
            onViewLedger={handleViewLedger}
            onAddAccount={handleAddAccount}
          />
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger" className="mt-4">
          {selectedAccount ? (
            <LedViewWrapper account={selectedAccount} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScrollText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">Select an Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click on any account in the Chart of Accounts to view its ledger
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab('chart')}
              >
                Go to Chart of Accounts
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-4">
          <Accordion type="single" collapsible defaultValue="trial-balance" className="space-y-3">
            <AccordionItem value="trial-balance" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/30">
                <span className="font-semibold text-sm">Trial Balance</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <TrialBalance />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="income-statement" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/30">
                <span className="font-semibold text-sm">Income Statement (Profit & Loss)</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <IncomeStatement />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="balance-sheet" className="border border-border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/30">
                <span className="font-semibold text-sm">Balance Sheet</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <BalanceSheet />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>

      {/* Add Account Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Account</DialogTitle>
            <DialogDescription>
              Create a new account in the chart of accounts
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            defaultType={selectedAccountType}
            onSubmit={handleAccountSubmit}
            onCancel={() => setAccountDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Ledger View Dialog */}
      <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Ledger</DialogTitle>
            <DialogDescription>
              {selectedAccount ? `${selectedAccount.code} — ${selectedAccount.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <LedgerView account={selectedAccount} />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/** Wrapper to keep ledger view in the tab when account is selected */
function LedViewWrapper({ account }: { account: Account }) {
  return <LedgerView account={account} />;
}
