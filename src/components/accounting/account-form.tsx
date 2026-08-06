'use client';

// ============================================================
// AccountForm — Form to add/edit account
// Account Code, Name, Type, Parent, Opening Balance, Description
// react-hook-form + zod validation
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  chartOfAccounts,
  type AccountType,
} from '@/lib/accounting/sample-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const accountSchema = z.object({
  code: z.string().min(1, 'Account code is required').regex(/^\d{4}$/, 'Code must be 4 digits'),
  name: z.string().min(1, 'Account name is required').max(100, 'Name too long'),
  type: z.enum(['Asset', 'Liability', 'Income', 'Expense', 'Equity'] as const),
  parentId: z.string().nullable(),
  openingBalance: z.number().min(0, 'Balance cannot be negative'),
  description: z.string().max(200, 'Description too long').optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export interface AccountFormProps {
  /** Pre-fill type (e.g., when adding from a type section) */
  defaultType?: AccountType;
  /** Submit handler */
  onSubmit: (values: AccountFormValues) => void;
  /** Cancel handler */
  onCancel: () => void;
  /** Is editing existing account? */
  isEditing?: boolean;
  /** Default values for editing */
  defaultValues?: Partial<AccountFormValues>;
}

export default function AccountForm({
  defaultType,
  onSubmit,
  onCancel,
  isEditing = false,
  defaultValues,
}: AccountFormProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: defaultValues?.code ?? '',
      name: defaultValues?.name ?? '',
      type: defaultValues?.type ?? defaultType ?? 'Asset',
      parentId: defaultValues?.parentId ?? null,
      openingBalance: defaultValues?.openingBalance ?? 0,
      description: defaultValues?.description ?? '',
    },
  });

  const watchedType = form.watch('type');

  // Get potential parent accounts (top-level accounts of the same type)
  const parentOptions = React.useMemo(() => {
    return chartOfAccounts.filter(
      (a) => a.type === watchedType && a.parentId === null && a.id !== defaultValues?.code
    );
  }, [watchedType, defaultValues]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Account Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., 1010"
                  className="font-mono"
                  maxLength={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Cash in Hand" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue('parentId', null);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Account */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Account</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                value={field.value ?? 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Top-level)</SelectItem>
                  {parentOptions.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      <span className="font-mono text-xs mr-2">{acc.code}</span>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Opening Balance */}
        <FormField
          control={form.control}
          name="openingBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Balance (৳)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  placeholder="0"
                  min={0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder="Optional description..."
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isEditing ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
