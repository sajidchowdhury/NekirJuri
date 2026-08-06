'use client';

// ============================================================
// JournalEntryForm — Form to add/edit journal entry
// Date, Description, dynamic line items (Account, Debit, Credit),
// balance indicator, Save Draft + Post Entry
// ============================================================

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  chartOfAccounts,
  formatTaka,
  type JournalEntry,
} from '@/lib/accounting/sample-data';

const lineItemSchema = z.object({
  accountId: z.string().min(1, 'Select an account'),
  debit: z.number().min(0),
  credit: z.number().min(0),
}).refine((data) => !(data.debit > 0 && data.credit > 0), {
  message: 'Only one of debit or credit can have a value',
  path: ['debit'],
});

const journalEntrySchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Too long'),
  reference: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(2, 'At least 2 line items required'),
});

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

export interface JournalEntryFormProps {
  /** Default values for editing */
  defaultValues?: Partial<JournalEntry>;
  /** Save as draft callback */
  onSaveDraft: (values: JournalEntryFormValues) => void;
  /** Post entry callback */
  onPostEntry: (values: JournalEntryFormValues) => void;
  /** Cancel callback */
  onCancel: () => void;
  /** Is editing? */
  isEditing?: boolean;
}

export default function JournalEntryForm({
  defaultValues,
  onSaveDraft,
  onPostEntry,
  onCancel,
  isEditing = false,
}: JournalEntryFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: defaultValues?.date ?? today,
      description: defaultValues?.description ?? '',
      reference: defaultValues?.reference ?? '',
      lineItems: defaultValues?.lineItems?.map((l) => ({
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
      })) ?? [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  // Calculate totals
  const lineItems = form.watch('lineItems');
  const totalDebit = lineItems.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = lineItems.reduce((s, l) => s + (l.credit || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalCredit > 0 && totalDebit === totalCredit;

  // Leaf accounts for the select
  const leafAccounts = chartOfAccounts.filter((a) => a.isActive);

  return (
    <Form {...form}>
      <form className="space-y-4">
        {/* Header fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference (optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="e.g., INV-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="e.g., Fee collection for January" rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Line Items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => append({ accountId: '', debit: 0, credit: 0 })}
            >
              <Plus className="h-3.5 w-3.5" /> Add Line
            </Button>
          </div>

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-3 rounded-lg border border-border bg-muted/10"
              >
                {/* Account Select */}
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.accountId`}
                  render={({ field: f }) => (
                    <FormItem className="flex-1 min-w-0">
                      <FormLabel className="text-xs">
                        {index === 0 ? 'Account' : ''}
                      </FormLabel>
                      <Select onValueChange={f.onChange} value={f.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leafAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id} className="text-xs">
                              <span className="font-mono mr-1.5">{acc.code}</span>
                              {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Debit */}
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.debit`}
                  render={({ field: f }) => (
                    <FormItem className="w-28">
                      <FormLabel className="text-xs">
                        {index === 0 ? 'Debit (৳)' : ''}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...f}
                          value={f.value || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            f.onChange(val);
                            // Clear credit if debit has value
                            if (val > 0) {
                              form.setValue(`lineItems.${index}.credit`, 0);
                            }
                          }}
                          placeholder="0"
                          min={0}
                          className="h-9 font-mono text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Credit */}
                <FormField
                  control={form.control}
                  name={`lineItems.${index}.credit`}
                  render={({ field: f }) => (
                    <FormItem className="w-28">
                      <FormLabel className="text-xs">
                        {index === 0 ? 'Credit (৳)' : ''}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...f}
                          value={f.value || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            f.onChange(val);
                            // Clear debit if credit has value
                            if (val > 0) {
                              form.setValue(`lineItems.${index}.debit`, 0);
                            }
                          }}
                          placeholder="0"
                          min={0}
                          className="h-9 font-mono text-xs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Remove button */}
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary footer */}
        <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Debit</span>
            <span className="font-mono font-medium">{formatTaka(totalDebit)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Credit</span>
            <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
              {formatTaka(totalCredit)}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            {isBalanced ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Balanced ✓
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400">
                <XCircle className="h-4 w-4" /> Unbalanced ✗ Difference: {formatTaka(difference)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-stone-100 dark:bg-stone-800"
            onClick={() => form.handleSubmit(onSaveDraft)()}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            className={cn(
              'bg-emerald-600 hover:bg-emerald-700 text-white',
              !isBalanced && 'opacity-50 cursor-not-allowed'
            )}
            disabled={!isBalanced}
            onClick={() => form.handleSubmit(onPostEntry)()}
          >
            Post Entry
          </Button>
        </div>
      </form>
    </Form>
  );
}
