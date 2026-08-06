'use client';

// ============================================================
// PaymentReceipt — Print-optimized receipt card
// Bismillah header, institution name, receipt details, emerald/gold accents
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Printer, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BismillahHeader from '@/components/islamic/bismillah-header';
import {
  type PaymentMethod,
  formatTaka,
} from '@/lib/finance/sample-data';

interface PaymentReceiptProps {
  receiptNo: string;
  date: string;
  studentName: string;
  studentNameBn: string;
  className: string;
  amount: number;
  method: PaymentMethod;
  invoiceNo: string;
  receivedBy: string;
  institutionName?: string;
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash / নগদ',
  bkash: 'bKash / বিকাশ',
  bank: 'Bank Transfer / ব্যাংক',
  cheque: 'Cheque / চেক',
};

export default function PaymentReceipt({
  receiptNo,
  date,
  studentName,
  studentNameBn,
  className: cls,
  amount,
  method,
  invoiceNo,
  receivedBy,
  institutionName = 'Darul Uloom Madrasha',
}: PaymentReceiptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden print:border-emerald-600">
        {/* Emerald top accent bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500" />

        <CardContent className="p-6 space-y-4">
          {/* Bismillah */}
          <BismillahHeader size="sm" />

          {/* Institution Name */}
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{institutionName}</h2>
            <p className="text-xs text-muted-foreground">Fee Payment Receipt / ফি প্রদানের রসিদ</p>
          </div>

          <Separator className="border-emerald-200 dark:border-emerald-800" />

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Receipt #</p>
              <p className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">{receiptNo}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="font-medium">{date}</p>
            </div>
          </div>

          <Separator />

          {/* Student Info */}
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Student Name</p>
                <p className="font-medium">{studentName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">শিক্ষার্থীর নাম</p>
                <p className="font-medium">{studentNameBn}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Class</p>
                <p className="font-medium">{cls}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Invoice #</p>
                <p className="font-mono text-sm">{invoiceNo}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount Received</p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{formatTaka(amount)}</p>
              <p className="text-sm text-muted-foreground">via {methodLabels[method]}</p>
            </div>
          </div>

          <Separator />

          {/* Received by and Stamp area */}
          <div className="flex items-end justify-between gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Received By</p>
              <p className="font-medium">{receivedBy}</p>
            </div>
            <div className="text-right">
              <div className="border-2 border-dashed border-stone-300 dark:border-stone-600 rounded-lg w-28 h-28 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Stamp / সিল</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-2 border-t border-dashed border-border">
            This is a computer-generated receipt. No signature required.
          </div>
        </CardContent>

        {/* Gold bottom accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />
      </Card>

      {/* Print buttons */}
      <div className="flex justify-end gap-2 mt-3">
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>
    </motion.div>
  );
}
