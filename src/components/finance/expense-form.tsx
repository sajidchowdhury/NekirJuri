'use client';

// ============================================================
// ExpenseForm — Add/Edit expense with react-hook-form + zod
// Posts to /api/expenses for create
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSubmit } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  type ExpenseCategory,
  type PaymentMethod,
} from '@/lib/finance/sample-data';

const expenseSchema = z.object({
  category: z.enum(['utilities', 'maintenance', 'stationery', 'food', 'transport', 'salary', 'misc']),
  amount: z.coerce.number().min(1, 'Amount must be at least ৳1'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Description is required'),
  method: z.enum(['cash', 'bkash', 'bank', 'cheque']),
  receiptRef: z.string().optional(),
  note: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const categoryOptions: { value: ExpenseCategory; label: string }[] = [
  { value: 'salary', label: 'Salary / বেতন' },
  { value: 'utilities', label: 'Utilities / ইউটিলিটি' },
  { value: 'food', label: 'Food / খাদ্য' },
  { value: 'maintenance', label: 'Maintenance / রক্ষণাবেক্ষণ' },
  { value: 'stationery', label: 'Stationery / স্টেশনারি' },
  { value: 'transport', label: 'Transport / পরিবহন' },
  { value: 'misc', label: 'Misc / বিবিধ' },
];

const methodOptions: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash / নগদ' },
  { value: 'bkash', label: 'bKash / বিকাশ' },
  { value: 'bank', label: 'Bank / ব্যাংক' },
  { value: 'cheque', label: 'Cheque / চেক' },
];

/** Map category enum string to a numeric ID for API */
const categoryToId: Record<ExpenseCategory, number> = {
  utilities: 1,
  maintenance: 2,
  stationery: 3,
  food: 4,
  transport: 5,
  salary: 6,
  misc: 7,
};

interface ExpenseFormProps {
  onSuccess?: () => void;
  editDefaults?: Partial<ExpenseFormValues>;
}

export default function ExpenseForm({ onSuccess, editDefaults }: ExpenseFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: editDefaults?.category ?? 'utilities',
      amount: editDefaults?.amount ?? 0,
      date: editDefaults?.date ?? new Date().toISOString().split('T')[0],
      description: editDefaults?.description ?? '',
      method: editDefaults?.method ?? 'cash',
      receiptRef: editDefaults?.receiptRef ?? '',
      note: editDefaults?.note ?? '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormValues) =>
      apiSubmit('/api/expenses', 'POST', {
        expenseCategoryId: categoryToId[data.category],
        amount: data.amount,
        description: data.description,
        expenseDate: data.date,
        paymentMethod: data.method,
        receiptRef: data.receiptRef,
        note: data.note,
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense recorded successfully', {
        description: `${variables.description} — ৳${variables.amount.toLocaleString('en-IN')} (${variables.category})`,
      });
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to record expense');
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Category + Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(val) => form.setValue('category', val as ExpenseCategory)}
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

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What was this expense for..."
          rows={2}
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-xs text-rose-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Receipt/Reference # */}
      <div className="space-y-1.5">
        <Label htmlFor="receiptRef">Receipt / Reference #</Label>
        <Input
          id="receiptRef"
          placeholder="Optional receipt or reference number"
          {...form.register('receiptRef')}
        />
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Additional note..."
          rows={2}
          {...form.register('note')}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {createMutation.isPending ? 'Recording...' : 'Record Expense'}
      </Button>
    </motion.form>
  );
}
