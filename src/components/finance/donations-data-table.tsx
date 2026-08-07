'use client';

// ============================================================
// DonationsDataTable — Full data table of donations with
// recurring status, nextDueDate, payment recording, filtering
// CR-5: Recurring donation indicators and actions
// ============================================================

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Eye,
  RefreshCw,
  CalendarClock,
  Printer,
  Trash2,
} from 'lucide-react';
import { DataTable } from '@/components/organisms/data-table';
import { toast } from 'sonner';
import RecurringPaymentDialog from './recurring-payment-dialog';

// --- Types ---
export interface DonationRecord {
  id: number;
  receiptNo: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  isRecurring: boolean;
  recurringFrequency?: string | null;
  recurringAmount?: number | null;
  nextDueDate?: string | null;
  reminderSent: boolean;
  lastPaymentDate?: string | null;
  isAnonymous: boolean;
  status: string;
  remarks?: string | null;
  donationCategory: { id: number; name: string } | null;
  donor: { id: number; name: string; phone?: string; email?: string; reminderConsent?: boolean } | null;
}

// --- Helpers ---
function formatTaka(amount: number): string {
  return `৳${amount.toLocaleString('en-IN')}`;
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// --- Component ---
interface DonationsDataTableProps {
  donations: DonationRecord[];
  onRefresh?: () => void;
}

export default function DonationsDataTable({ donations, onRefresh }: DonationsDataTableProps) {
  const [selectedDonation, setSelectedDonation] = React.useState<DonationRecord | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);

  const handleRecordPayment = (donation: DonationRecord) => {
    setSelectedDonation(donation);
    setShowPaymentDialog(true);
  };

  const handleViewDetail = (donation: DonationRecord) => {
    setSelectedDonation(donation);
    setShowDetailDialog(true);
  };

  const handlePrintReceipt = (donation: DonationRecord) => {
    toast.info('Printing receipt...', { description: `Receipt ${donation.receiptNo}` });
    window.print();
  };

  const columns: ColumnDef<DonationRecord, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'receiptNo',
      header: 'Receipt No',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.receiptNo}</span>
      ),
    },
    {
      id: 'donor',
      header: 'Donor',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">
            {row.original.isAnonymous ? 'Anonymous' : (row.original.donor?.name || 'Unknown')}
          </p>
          {!row.original.isAnonymous && row.original.donor?.phone && (
            <p className="text-xs text-muted-foreground font-mono">{row.original.donor.phone}</p>
          )}
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs border-0 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
          {row.original.donationCategory?.name || 'General'}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {formatTaka(Number(row.original.amount))}
        </span>
      ),
    },
    {
      accessorKey: 'paymentDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.paymentDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => {
        const methodLabels: Record<string, string> = {
          cash: 'Cash',
          bkash: 'bKash',
          bank: 'Bank',
          cheque: 'Cheque',
        };
        return (
          <Badge variant="secondary" className="text-xs">
            {methodLabels[row.original.paymentMethod] || row.original.paymentMethod}
          </Badge>
        );
      },
    },
    {
      id: 'recurring',
      header: 'Type',
      cell: ({ row }) => {
        const d = row.original;
        if (!d.isRecurring) {
          return <Badge variant="outline" className="text-xs">One-time</Badge>;
        }
        const days = daysUntil(d.nextDueDate);
        const isUrgent = days !== null && days <= 3;
        const isOverdue = days !== null && days < 0;

        return (
          <div className="space-y-1">
            <Badge className={`text-xs ${isOverdue ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-0' : isUrgent ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0'}`}>
              <RefreshCw className="h-3 w-3 mr-1" />
              {d.recurringFrequency === 'monthly' ? 'Monthly' : 'Yearly'}
            </Badge>
            {d.nextDueDate && (
              <p className={`text-[10px] ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                {isOverdue ? 'Overdue!' : `${days}d left`}
                {' • '}
                {new Date(d.nextDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap: Record<string, { label: string; variant: string }> = {
          completed: { label: 'Completed', variant: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
          pending: { label: 'Pending', variant: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
          cancelled: { label: 'Cancelled', variant: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' },
        };
        const s = statusMap[row.original.status] || statusMap.pending;
        return (
          <Badge className={`text-xs border-0 ${s.variant}`}>{s.label}</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetail(row.original)} className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {row.original.isRecurring && (
              <DropdownMenuItem onClick={() => handleRecordPayment(row.original)} className="gap-2 cursor-pointer text-emerald-600">
                <RefreshCw className="h-4 w-4" />
                Record Payment
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handlePrintReceipt(row.original)} className="gap-2 cursor-pointer">
              <Printer className="h-4 w-4" />
              Print Receipt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  // Mobile card render
  const renderCard = (d: DonationRecord) => {
    const days = daysUntil(d.nextDueDate);
    const isOverdue = d.isRecurring && days !== null && days < 0;
    const isUrgent = d.isRecurring && days !== null && days >= 0 && days <= 3;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{d.receiptNo}</span>
            {d.isRecurring && (
              <RefreshCw className={`h-3.5 w-3.5 ${isOverdue ? 'text-rose-500' : isUrgent ? 'text-amber-500' : 'text-emerald-500'}`} />
            )}
          </div>
          <Badge variant="outline" className="text-xs border-0 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
            {d.donationCategory?.name || 'General'}
          </Badge>
        </div>
        <p className="font-medium">
          {d.isAnonymous ? 'Anonymous' : (d.donor?.name || 'Unknown')}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatTaka(Number(d.amount))}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(d.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        {d.isRecurring && d.nextDueDate && (
          <div className={`text-xs ${isOverdue ? 'text-rose-600 dark:text-rose-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
            <CalendarClock className="h-3 w-3 inline mr-1" />
            {isOverdue ? 'Overdue!' : `Due in ${days}d`} — {new Date(d.nextDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={donations}
        searchable
        searchPlaceholder="Search donations, receipts, donors..."
        sortable
        paginated
        pageSize={10}
        renderCard={renderCard}
        emptyMessage="No donations found"
        emptyDescription="Record a new donation to get started."
      />

      {/* Recurring Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-emerald-600" />
              Record Recurring Payment
            </DialogTitle>
            <DialogDescription>
              Record a payment for this recurring donation. The next due date will be auto-advanced.
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <RecurringPaymentDialog
              donation={selectedDonation}
              onSuccess={() => {
                setShowPaymentDialog(false);
                setSelectedDonation(null);
                onRefresh?.();
              }}
              onCancel={() => {
                setShowPaymentDialog(false);
                setSelectedDonation(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Donation Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>
              {selectedDonation?.receiptNo}
            </DialogDescription>
          </DialogHeader>
          {selectedDonation && (
            <DonationDetail donation={selectedDonation} onRecordPayment={() => {
              setShowDetailDialog(false);
              handleRecordPayment(selectedDonation);
            }} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Donation Detail View ---
function DonationDetail({ donation, onRecordPayment }: {
  donation: DonationRecord;
  onRecordPayment?: () => void;
}) {
  return (
    <div className="space-y-4 text-sm">
      {/* Header info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-muted-foreground text-xs">Donor</p>
          <p className="font-medium">{donation.isAnonymous ? 'Anonymous' : (donation.donor?.name || 'Unknown')}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Category</p>
          <p className="font-medium">{donation.donationCategory?.name || 'General'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Amount</p>
          <p className="font-bold text-amber-600 dark:text-amber-400">{formatTaka(Number(donation.amount))}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Payment Date</p>
          <p>{new Date(donation.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Payment Method</p>
          <p className="capitalize">{donation.paymentMethod}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Status</p>
          <Badge className={`text-xs border-0 ${donation.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : donation.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'}`}>
            {donation.status}
          </Badge>
        </div>
      </div>

      {/* Recurring info */}
      {donation.isRecurring && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-sm">Recurring Donation</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Frequency</p>
              <p className="font-medium capitalize">{donation.recurringFrequency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pledge Amount</p>
              <p className="font-medium">{formatTaka(Number(donation.recurringAmount || donation.amount))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Next Due Date</p>
              <p className="font-medium">
                {donation.nextDueDate
                  ? new Date(donation.nextDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Payment</p>
              <p className="font-medium">
                {donation.lastPaymentDate
                  ? new Date(donation.lastPaymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Reminder Sent</p>
              <p className="font-medium">{donation.reminderSent ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Donor Reminder Consent</p>
              <p className="font-medium">{donation.donor?.reminderConsent ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <Button
            onClick={onRecordPayment}
            size="sm"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Record Payment
          </Button>
        </div>
      )}

      {/* Remarks */}
      {donation.remarks && (
        <div>
          <p className="text-muted-foreground text-xs">Remarks</p>
          <p>{donation.remarks}</p>
        </div>
      )}
    </div>
  );
}
