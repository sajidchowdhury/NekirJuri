'use client';

// ============================================================
// Donations Page — Full donations management with dashboard, list, form
// CR-5: Recurring donation support with upcoming widget, payment recording
// Fetches data from /api/donations with React Query
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import DonationDashboard from '@/components/finance/donation-dashboard';
import DonationForm from '@/components/finance/donation-form';
import DonationsDataTable, { type DonationRecord } from '@/components/finance/donations-data-table';
import { slideUp } from '@/lib/animations';

export default function DonationsPage() {
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [filterRecurring, setFilterRecurring] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'list'>('dashboard');

  // Fetch donations from API
  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['donations', filterRecurring, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      if (filterRecurring) params.set('isRecurring', 'true');
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/donations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch donations');
      return res.json();
    },
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  // Transform API data to component shape
  const donations: DonationRecord[] = React.useMemo(() => {
    const raw = apiResponse?.data || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((d: Record<string, unknown>) => ({
      id: d.id as number,
      receiptNo: d.receiptNo as string,
      amount: Number(d.amount),
      paymentMethod: d.paymentMethod as string,
      paymentDate: d.paymentDate as string,
      isRecurring: d.isRecurring as boolean,
      recurringFrequency: d.recurringFrequency as string | null,
      recurringAmount: d.recurringAmount ? Number(d.recurringAmount) : null,
      nextDueDate: d.nextDueDate as string | null,
      reminderSent: d.reminderSent as boolean,
      lastPaymentDate: d.lastPaymentDate as string | null,
      isAnonymous: d.isAnonymous as boolean,
      status: d.status as string,
      remarks: d.remarks as string | null,
      donationCategory: d.donationCategory as { id: number; name: string } | null,
      donor: d.donor as { id: number; name: string; phone?: string; email?: string; reminderConsent?: boolean } | null,
    }));
  }, [apiResponse]);

  // Stats
  const totalDonations = donations.length;
  const recurringCount = donations.filter((d) => d.isRecurring).length;
  const recurringPledged = donations
    .filter((d) => d.isRecurring)
    .reduce((sum, d) => sum + Number(d.recurringAmount || d.amount), 0);

  const handleExportCSV = () => {
    // Simulate export
    const link = document.createElement('a');
    link.href = '#';
    link.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Donation Management"
        description="Track donations, manage donors, and analyze giving patterns"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Donation
            </Button>
          </div>
        }
      />

      {/* CR-5: Recurring Donations Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recurring Donations</p>
            <p className="text-lg font-bold">{recurringCount}</p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Pledged (Recurring)</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ৳{recurringPledged.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
            <Filter className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Filter: Recurring Only</p>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={filterRecurring}
                  onCheckedChange={setFilterRecurring}
                />
                <span className="text-xs text-muted-foreground">
                  {filterRecurring ? 'Yes' : 'All'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher: Dashboard / List */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
            activeTab === 'list'
              ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Donations
          {totalDonations > 0 && (
            <Badge variant="secondary" className="ml-1.5 text-xs">{totalDonations}</Badge>
          )}
        </button>

        {/* Status filter (right aligned) */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && <DonationDashboard />}

      {/* List View */}
      {activeTab === 'list' && (
        <DonationsDataTable
          donations={donations}
          onRefresh={() => refetch()}
        />
      )}

      {/* Add/Edit Donation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record New Donation</DialogTitle>
            <DialogDescription>
              Enter donation details to record a new contribution
            </DialogDescription>
          </DialogHeader>
          <DonationForm
            onSuccess={() => {
              setShowAddDialog(false);
              refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
