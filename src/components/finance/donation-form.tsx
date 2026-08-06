'use client';

// ============================================================
// DonationForm — Add/Edit donation with react-hook-form + zod
// CR-5: Recurring donations — One-time/Monthly/Yearly toggle,
// recurring amount, next due date display
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  sampleDonors,
  type DonationCategory,
  type PaymentMethod,
} from '@/lib/finance/sample-data';

const donationSchema = z.object({
  donorName: z.string().min(2, 'Donor name is required'),
  donorPhone: z.string().min(6, 'Valid phone number required'),
  category: z.enum(['zakat', 'sadaqah', 'general', 'construction', 'education']),
  amount: z.coerce.number().min(1, 'Amount must be at least ৳1'),
  date: z.string().min(1, 'Date is required'),
  method: z.enum(['cash', 'bkash', 'bank', 'cheque']),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['monthly', 'yearly']).optional(),
  recurringAmount: z.coerce.number().min(1).optional(),
  note: z.string().optional(),
}).refine((data) => {
  if (data.isRecurring && !data.recurringFrequency) return false;
  return true;
}, {
  message: 'Frequency is required for recurring donations',
  path: ['recurringFrequency'],
});

type DonationFormValues = z.infer<typeof donationSchema>;

const categoryOptions: { value: DonationCategory; label: string }[] = [
  { value: 'zakat', label: 'Zakat / যাকাত' },
  { value: 'sadaqah', label: 'Sadaqah / সাদাকাহ' },
  { value: 'general', label: 'General / সাধারণ' },
  { value: 'construction', label: 'Construction / নির্মাণ' },
  { value: 'education', label: 'Education / শিক্ষা' },
];

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash / নগদ' },
  { value: 'bkash', label: 'bKash / বিকাশ' },
  { value: 'bank', label: 'Bank / ব্যাংক' },
  { value: 'cheque', label: 'Cheque / চেক' },
];

/** Calculate next due date display */
function getNextDueDate(frequency: string, fromDate: string): string {
  if (!fromDate || !frequency) return '';
  const d = new Date(fromDate);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface DonationFormProps {
  onSuccess?: () => void;
  editDefaults?: Partial<DonationFormValues>;
}

export default function DonationForm({ onSuccess, editDefaults }: DonationFormProps) {
  const [donorSearch, setDonorSearch] = React.useState('');
  const [showDonorSuggestions, setShowDonorSuggestions] = React.useState(false);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: editDefaults?.donorName ?? '',
      donorPhone: editDefaults?.donorPhone ?? '',
      category: editDefaults?.category ?? 'zakat',
      amount: editDefaults?.amount ?? 0,
      date: editDefaults?.date ?? new Date().toISOString().split('T')[0],
      method: editDefaults?.method ?? 'cash',
      isRecurring: editDefaults?.isRecurring ?? false,
      recurringFrequency: editDefaults?.recurringFrequency,
      recurringAmount: editDefaults?.recurringAmount,
      note: editDefaults?.note ?? '',
    },
  });

  const isRecurring = form.watch('isRecurring');
  const recurringFrequency = form.watch('recurringFrequency');
  const donationDate = form.watch('date');
  const recurringAmount = form.watch('recurringAmount');
  const donationAmount = form.watch('amount');

  const filteredDonors = sampleDonors.filter((d) =>
    d.name.toLowerCase().includes(donorSearch.toLowerCase())
  );

  const handleDonorSelect = (donor: typeof sampleDonors[0]) => {
    form.setValue('donorName', donor.name);
    form.setValue('donorPhone', donor.phone);
    setDonorSearch(donor.name);
    setShowDonorSuggestions(false);
  };

  const onSubmit = (data: DonationFormValues) => {
    const pledgeAmount = data.isRecurring ? (data.recurringAmount || data.amount) : data.amount;
    const nextDue = data.isRecurring ? getNextDueDate(data.recurringFrequency!, data.date) : '';

    if (data.isRecurring) {
      toast.success('Recurring donation recorded', {
        description: `${data.donorName} — ৳${pledgeAmount.toLocaleString('en-IN')}/${data.recurringFrequency} (${data.category}). Next due: ${nextDue}`,
      });
    } else {
      toast.success('Donation recorded successfully', {
        description: `${data.donorName} — ৳${data.amount.toLocaleString('en-IN')} (${data.category})`,
      });
    }
    onSuccess?.();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Donor Name with autocomplete */}
      <div className="space-y-1.5 relative">
        <Label htmlFor="donorName">Donor Name</Label>
        <Input
          id="donorName"
          placeholder="Search existing donor or type new name..."
          {...form.register('donorName')}
          value={donorSearch || form.watch('donorName')}
          onChange={(e) => {
            setDonorSearch(e.target.value);
            form.setValue('donorName', e.target.value);
            setShowDonorSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => {
            if (donorSearch.length > 0 || form.watch('donorName').length > 0) {
              setShowDonorSuggestions(true);
            }
          }}
        />
        {showDonorSuggestions && filteredDonors.length > 0 && (
          <div className="absolute top-full left-0 right'0 z-50 mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
            {filteredDonors.map((donor) => (
              <button
                key={donor.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                onClick={() => handleDonorSelect(donor)}
              >
                <span className="font-medium">{donor.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{donor.phone}</span>
              </button>
            ))}
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-emerald-600 hover:bg-muted/50 transition-colors border-t border-border"
              onClick={() => setShowDonorSuggestions(false)}
            >
              + New Donor
            </button>
          </div>
        )}
        {form.formState.errors.donorName && (
          <p className="text-xs text-rose-500">{form.formState.errors.donorName.message}</p>
        )}
      </div>

      {/* Donor Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="donorPhone">Donor Phone</Label>
        <Input
          id="donorPhone"
          placeholder="01XXX-XXXXXX"
          {...form.register('donorPhone')}
        />
        {form.formState.errors.donorPhone && (
          <p className="text-xs text-rose-500">{form.formState.errors.donorPhone.message}</p>
        )}
      </div>

      {/* Category + Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(val) => form.setValue('category', val as DonationCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (৳)</Label>
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
      </div>

      {/* CR-5: Recurring Donation Toggle */}
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <Label className="text-sm font-medium cursor-pointer" onClick={() => form.setValue('isRecurring', !isRecurring)}>
              Recurring Donation
            </Label>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={(v) => {
              form.setValue('isRecurring', v);
              if (!v) {
                form.setValue('recurringFrequency', undefined);
                form.setValue('recurringAmount', undefined);
              }
            }}
          />
        </div>

        {isRecurring && (
          <div className="space-y-3">
            {/* Frequency selector */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Frequency</Label>
                <Select
                  value={recurringFrequency || ''}
                  onValueChange={(val) => form.setValue('recurringFrequency', val as 'monthly' | 'yearly')}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Monthly / মাসিক
                      </div>
                    </SelectItem>
                    <SelectItem value="yearly">
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Yearly / বার্ষিক
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.recurringFrequency && (
                  <p className="text-xs text-rose-500">{form.formState.errors.recurringFrequency.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Pledge Amount (৳)</Label>
                <Input
                  type="number"
                  placeholder={String(donationAmount || 0)}
                  className="h-9 text-sm"
                  {...form.register('recurringAmount', { valueAsNumber: true })}
                />
                <p className="text-[10px] text-muted-foreground">Per period. Defaults to donation amount if blank.</p>
              </div>
            </div>

            {/* Next due date preview */}
            {recurringFrequency && donationDate && (
              <div className="rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-amber-700 dark:text-amber-300">
                    Next payment due: <strong>{getNextDueDate(recurringFrequency, donationDate)}</strong>
                  </span>
                </div>
                <p className="mt-1 text-amber-600/80 dark:text-amber-400/80">
                  Reminders will be sent 7 days before due date.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date + Payment Method */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...form.register('date')}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Payment Method</Label>
          <Select
            value={form.watch('method')}
            onValueChange={(val) => form.setValue('method', val as PaymentMethod)}
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

      {/* Note / Reference */}
      <div className="space-y-1.5">
        <Label htmlFor="note">Note / Reference</Label>
        <Textarea
          id="note"
          placeholder="Optional note or reference..."
          rows={2}
          {...form.register('note')}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {isRecurring ? (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Record Recurring Donation
          </span>
        ) : (
          'Record Donation'
        )}
      </Button>
    </motion.form>
  );
}
