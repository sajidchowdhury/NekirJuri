'use client';

// ============================================================
// RecurringPaymentDialog — Record a payment for a recurring donation
// Advances nextDueDate and resets reminderSent
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { CalendarClock, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be at least ৳1'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['cash', 'bkash', 'bank', 'cheque']),
  transactionRef: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface RecurringPaymentDialogProps {
  donation: {
    id: number;
    receiptNo: string;
    amount: number;
    recurringAmount?: number | null;
    recurringFrequency?: string | null;
    nextDueDate?: string | null;
    donor?: { name: string } | null;
    donationCategory?: { name: string } | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const methodOptions = [
  { value: 'cash', label: 'Cash / নগদ' },
  { value: 'bkash', label: 'bKash / বিকাশ' },
  { value: 'bank', label: 'Bank / ব্যাংক' },
  { value: 'cheque', label: 'Cheque / চেক' },
];

function getNextDueDateLabel(frequency: string | null | undefined, fromDate: string): string {
  if (!fromDate || !frequency) return '';
  const d = new Date(fromDate);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function RecurringPaymentDialog({
  donation,
  onSuccess,
  onCancel,
}: RecurringPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: Number(donation.recurringAmount || donation.amount),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      transactionRef: '',
    },
  });

  const paymentDate = form.watch('paymentDate');
  const nextDueLabel = getNextDueDateLabel(donation.recurringFrequency, paymentDate);

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: donation.id,
          amount: data.amount,
          paymentDate: data.paymentDate,
          paymentMethod: data.paymentMethod,
          transactionRef: data.transactionRef || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to record payment');
      }

      const result = await res.json();
      toast.success('Recurring payment recorded', {
        description: `৳${data.amount.toLocaleString('en-IN')} from ${donation.donor?.name || 'Anonymous'}. Next due: ${nextDueLabel}`,
      });
      onSuccess?.();
    } catch (err) {
      toast.error('Failed to record payment', {
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Donation info summary */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{donation.donor?.name || 'Anonymous'}</span>
          <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0">
            {donation.recurringFrequency === 'monthly' ? 'Monthly' : 'Yearly'}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>৳{Number(donation.recurringAmount || donation.amount).toLocaleString('en-IN')}/{donation.recurringFrequency === 'monthly' ? 'mo' : 'yr'}</span>
          <span>•</span>
          <span>{donation.donationCategory?.name || ''}</span>
          <span>•</span>
          <span>Receipt: {donation.receiptNo}</span>
        </div>
        {donation.nextDueDate && (
          <div className="flex items-center gap-1.5 text-xs">
            <CalendarClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-700 dark:text-amber-300">
              Current due: <strong>{new Date(donation.nextDueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            </span>
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount">Payment Amount (৳)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            {...form.register('amount', { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="text-xs text-rose-500">{form.formState.errors.amount.message}</p>
          )}
        </div>

        {/* Payment Date + Method */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              {...form.register('paymentDate')}
            />
            {form.formState.errors.paymentDate && (
              <p className="text-xs text-rose-500">{form.formState.errors.paymentDate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Payment Method</Label>
            <Select
              value={form.watch('paymentMethod')}
              onValueChange={(val) => form.setValue('paymentMethod', val as 'cash' | 'bkash' | 'bank' | 'cheque')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Transaction Reference */}
        <div className="space-y-1.5">
          <Label htmlFor="transactionRef">Transaction Ref (optional)</Label>
          <Input
            id="transactionRef"
            placeholder="e.g., BK-123456789"
            {...form.register('transactionRef')}
          />
        </div>

        {/* Next due date preview */}
        {nextDueLabel && (
          <div className="rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300">
                After payment, next due: <strong>{nextDueLabel}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Recording...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Record Payment
              </span>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
