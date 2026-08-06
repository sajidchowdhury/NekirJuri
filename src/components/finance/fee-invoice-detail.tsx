'use client';

// ============================================================
// FeeInvoiceDetail — Invoice detail view with line items, totals, payment history
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Printer, User, Calendar, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/atoms/status-badge';
import BismillahHeader from '@/components/islamic/bismillah-header';
import {
  type FeeInvoice,
  type InvoiceStatus,
  type PaymentMethod,
  formatTaka,
} from '@/lib/finance/sample-data';

interface FeeInvoiceDetailProps {
  invoice: FeeInvoice;
  onClose?: () => void;
}

const statusMap: Record<InvoiceStatus, 'paid' | 'partial' | 'overdue'> = {
  paid: 'paid',
  partial: 'partial',
  overdue: 'overdue',
};

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash / নগদ',
  bkash: 'bKash / বিকাশ',
  bank: 'Bank Transfer / ব্যাংক',
  cheque: 'Cheque / চেক',
};

export default function FeeInvoiceDetail({ invoice, onClose }: FeeInvoiceDetailProps) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const totalDiscount = invoice.lineItems.reduce((sum, item) => sum + item.discount, 0);

  return (
    <div className="space-y-4">
      {/* Bismillah for print */}
      <BismillahHeader size="sm" showTranslation className="mb-2" />

      {/* Student Info Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="border-t-[3px] border-t-emerald-600 dark:border-t-emerald-400">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold">{invoice.studentName}</p>
                  <p className="text-sm text-muted-foreground">{invoice.studentNameBn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{invoice.className}</Badge>
                <StatusBadge status={statusMap[invoice.status]} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs">{invoice.invoiceNo}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Due: {invoice.dueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Session: {invoice.academicSession}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Generated: {invoice.generatedDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Line Items */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fee Category</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Discount</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2 font-medium">{item.categoryName}</td>
                      <td className="px-4 py-2 text-right text-amber-600 dark:text-amber-400">{formatTaka(item.amount)}</td>
                      <td className="px-4 py-2 text-right text-rose-500">
                        {item.discount > 0 ? `- ${formatTaka(item.discount)}` : '—'}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{formatTaka(item.netAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Totals */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">{formatTaka(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-rose-500 font-medium">- {formatTaka(totalDiscount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatTaka(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatTaka(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Balance</span>
                <span className={`font-bold ${invoice.balanceAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatTaka(invoice.balanceAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment History */}
      {invoice.payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {invoice.payments.map((payment, idx) => (
                  <div key={payment.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{formatTaka(payment.amount)} via {methodLabels[payment.method]}</p>
                      <p className="text-xs text-muted-foreground">{payment.date} • {payment.note} • By {payment.receivedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Print button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} size="sm">Close</Button>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
          <Printer className="h-4 w-4" />
          Print Invoice
        </Button>
      </div>
    </div>
  );
}
