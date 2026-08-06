'use client'

// ============================================================
// SimplifiedJournalEntryForm — Simple Income/Expense entry form
// CR-8: Simplified Accounting Mode
// No debit/credit, just: Type (Income/Expense), Account, Amount, Date, Description
// ============================================================

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { chartOfAccounts, type AccountType } from '@/lib/accounting/sample-data'

const simplifiedEntrySchema = z.object({
  type: z.enum(['income', 'expense']),
  accountId: z.string().min(1, 'Account is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required'),
  reference: z.string().optional(),
})

type SimplifiedEntryValues = z.infer<typeof simplifiedEntrySchema>

export interface SimplifiedJournalEntryFormProps {
  onSave?: (values: SimplifiedEntryValues) => void
  onCancel?: () => void
}

export default function SimplifiedJournalEntryForm({
  onSave,
  onCancel,
}: SimplifiedJournalEntryFormProps) {
  const t = useTranslations('accounting')

  const form = useForm<SimplifiedEntryValues>({
    resolver: zodResolver(simplifiedEntrySchema),
    defaultValues: {
      type: 'income',
      accountId: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
    },
  })

  const entryType = form.watch('type')

  // Filter accounts based on selected type
  const filteredAccounts = chartOfAccounts.filter((a) => {
    const matchType = entryType === 'income' ? 'Income' : 'Expense'
    return a.type === matchType && a.parentId !== null && a.isActive
  })

  const onSubmit = (values: SimplifiedEntryValues) => {
    toast.success(
      values.type === 'income'
        ? t('incomeRecorded')
        : t('expenseRecorded'),
      { description: `৳${values.amount.toLocaleString('en-IN')}` }
    )
    onSave?.(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Entry Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('entryType')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('income')}</SelectItem>
                    <SelectItem value="expense">{t('expense')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account */}
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('account')}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectAccount')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.code} — {acc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('amount')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  className="font-mono"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('descriptionPlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reference (optional) */}
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('reference')} <span className="text-xs text-muted-foreground">({t('optional')})</span></FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('referencePlaceholder')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
          )}
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {t('saveEntry')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
