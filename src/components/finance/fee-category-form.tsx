'use client';

// ============================================================
// FeeCategoryForm — Create/edit fee category
// react-hook-form + zod validation
// Fields: Name (En), Name (Bn), Code, Amount (৳), Frequency,
//         Is Recurring, Description, IsActive
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

// --- Zod Schema ---
const feeCategorySchema = z.object({
  name: z.string().min(1, 'Name (English) is required'),
  nameBn: z.string().optional(),
  code: z.string().min(1, 'Code is required').max(20, 'Code too long'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    'Amount must be a non-negative number'
  ),
  frequency: z.enum(['monthly', 'quarterly', 'annual', 'one-time']),
  isRecurring: z.boolean(),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type FeeCategoryFormData = z.infer<typeof feeCategorySchema>;

// --- Props ---
export interface FeeCategoryFormProps {
  /** If provided, the form is in edit mode */
  defaultValues?: Partial<FeeCategoryFormData> & { id?: number };
  /** Callback after successful create/update */
  onSuccess?: () => void;
  /** Additional class name */
  className?: string;
}

// --- Frequency Options ---
const frequencyOptions = [
  { value: 'monthly', label: 'মাসিক / Monthly' },
  { value: 'quarterly', label: 'ত্রৈমাসিক / Quarterly' },
  { value: 'annual', label: 'বার্ষিক / Annual' },
  { value: 'one-time', label: 'এককালীন / One-time' },
] as const;

export default function FeeCategoryForm({
  defaultValues,
  onSuccess,
  className,
}: FeeCategoryFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeeCategoryFormData>({
    resolver: zodResolver(feeCategorySchema),
    defaultValues: {
      name: '',
      nameBn: '',
      code: '',
      amount: '',
      frequency: 'monthly',
      isRecurring: true,
      description: '',
      isActive: true,
      ...defaultValues,
    },
  });

  const frequency = watch('frequency');
  const isRecurring = watch('isRecurring');
  const isActive = watch('isActive');

  // Auto-set isRecurring based on frequency
  React.useEffect(() => {
    if (frequency === 'one-time') {
      setValue('isRecurring', false);
    }
  }, [frequency, setValue]);

  const onSubmit = async (data: FeeCategoryFormData) => {
    setIsLoading(true);
    try {
      const body = {
        name: data.nameBn ? `${data.nameBn} / ${data.name}` : data.name,
        code: data.code,
        amount: Number(data.amount),
        frequency: data.frequency,
        isRecurring: data.isRecurring,
        description: data.description || null,
        isActive: data.isActive,
      };

      const isEdit = !!defaultValues?.id;
      const url = isEdit ? `/api/fee-categories/${defaultValues.id}` : '/api/fee-categories';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save fee category');
      }

      toast.success(isEdit ? 'Fee category updated' : 'Fee category created successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (n: keyof FeeCategoryFormData) => errors[n]?.message;
  const isEdit = !!defaultValues?.id;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name (English) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name (English) *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g. Tuition Fee"
            className={cn(fieldError('name') && 'border-rose-500')}
          />
          {fieldError('name') && <p className="text-xs text-rose-500">{fieldError('name')}</p>}
        </div>

        {/* Name (Bengali) */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameBn">নাম (বাংলা)</Label>
          <Input
            id="nameBn"
            {...register('nameBn')}
            placeholder="যেমন: টিউশন ফি"
          />
        </div>

        {/* Code */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            {...register('code')}
            placeholder="e.g. TUITION"
            className={cn(fieldError('code') && 'border-rose-500')}
            disabled={isEdit}
          />
          {fieldError('code') && <p className="text-xs text-rose-500">{fieldError('code')}</p>}
          {isEdit && <p className="text-xs text-muted-foreground">Code cannot be changed after creation</p>}
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Amount (৳) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-600 dark:text-amber-400">৳</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              {...register('amount')}
              placeholder="0.00"
              className={cn('pl-7', fieldError('amount') && 'border-rose-500')}
            />
          </div>
          {fieldError('amount') && <p className="text-xs text-rose-500">{fieldError('amount')}</p>}
        </div>

        {/* Frequency */}
        <div className="flex flex-col gap-1.5">
          <Label>Frequency *</Label>
          <Select
            value={frequency}
            onValueChange={(v) => setValue('frequency', v as FeeCategoryFormData['frequency'])}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {frequencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError('frequency') && <p className="text-xs text-rose-500">{fieldError('frequency')}</p>}
        </div>

        {/* Is Recurring */}
        <div className="flex flex-col gap-1.5">
          <Label>Recurring</Label>
          <div className="flex items-center gap-3 h-9">
            <Switch
              checked={isRecurring}
              onCheckedChange={(checked) => setValue('isRecurring', checked)}
              disabled={frequency === 'one-time'}
            />
            <span className="text-sm text-muted-foreground">
              {isRecurring ? 'Yes, repeats periodically' : 'No, one-time only'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Optional description or notes about this fee category..."
            rows={2}
          />
        </div>

        {/* Is Active */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('isActive', checked)}
            />
            <Label className="cursor-pointer">
              {isActive ? 'Active — visible in fee structures' : 'Inactive — hidden from fee structures'}
            </Label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
          {isLoading ? 'Saving...' : isEdit ? 'Update Fee Category' : 'Create Fee Category'}
        </Button>
      </div>
    </form>
  );
}
