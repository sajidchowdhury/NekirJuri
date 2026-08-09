'use client';

// ============================================================
// CollectPaymentForm — Search student → select invoice → enter payment
// Success state shows receipt preview
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle2, CreditCard, Banknote, Smartphone, Building, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import StatusBadge from '@/components/atoms/status-badge';
import {
  type FeeInvoice,
  type PaymentMethod,
  formatTaka,
} from '@/lib/finance/sample-data';

interface CollectPaymentFormProps {
  onSuccess?: (receiptNo: string) => void;
}

const methodOptions: { value: PaymentMethod; label: string; labelBn: string; icon: React.ReactNode }[] = [
  { value: 'cash', label: 'Cash', labelBn: 'নগদ', icon: <Banknote className="h-4 w-4" /> },
  { value: 'bkash', label: 'bKash', labelBn: 'বিকাশ', icon: <Smartphone className="h-4 w-4" /> },
  { value: 'bank', label: 'Bank Transfer', labelBn: 'ব্যাংক', icon: <Building className="h-4 w-4" /> },
  { value: 'cheque', label: 'Cheque', labelBn: 'চেক', icon: <FileText className="h-4 w-4" /> },
];

export default function CollectPaymentForm({ onSuccess }: CollectPaymentFormProps) {
  const [studentSearch, setStudentSearch] = React.useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('cash');
  const [paymentNote, setPaymentNote] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Fetch unpaid invoices from API
  const { data: invoicesResponse } = useQuery({
    queryKey: ['fee-invoices-unpaid'],
    queryFn: async () => {
      const res = await fetch('/api/fee-invoices?status=unpaid&limit=100');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const invoices: FeeInvoice[] = invoicesResponse?.data || [];

  // Get outstanding invoices matching search
  const outstandingInvoices = invoices.filter(inv =>
    inv.status !== 'paid' &&
    (inv.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
     inv.studentNameBn.includes(studentSearch) ||
     inv.invoiceNo.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  const handleSubmit = async () => {
    if (!selectedInvoice || !paymentAmount) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    const receiptNo = `RCT-2025-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    onSuccess?.(receiptNo);
  };

  const resetForm = () => {
    setStudentSearch('');
    setSelectedInvoiceId(null);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentNote('');
    setIsSuccess(false);
  };

  if (isSuccess && selectedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Payment Collected Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              {formatTaka(parseInt(paymentAmount, 10))} received from {selectedInvoice.studentName} via {paymentMethod}
            </p>
            <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700 mt-2">
              Collect Another Payment
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Step 1: Search Student */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            Search Student
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, Bengali name, or invoice #..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {studentSearch && outstandingInvoices.length > 0 && (
            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {outstandingInvoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvoiceId(inv.id);
                    setPaymentAmount(inv.balanceAmount.toString());
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors text-left ${
                    selectedInvoiceId === inv.id ? 'bg-emerald-50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-600' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inv.studentName} <span className="text-muted-foreground">({inv.studentNameBn})</span></p>
                    <p className="text-xs text-muted-foreground">{inv.invoiceNo} • {inv.className}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatTaka(inv.balanceAmount)}</p>
                    <StatusBadge status={inv.status === 'partial' ? 'partial' : 'overdue'} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {studentSearch && outstandingInvoices.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No outstanding invoices found</p>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Payment Details */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invoice summary */}
                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-mono">{selectedInvoice.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{formatTaka(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Already Paid</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatTaka(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Balance Due</span>
                    <span className="text-rose-600 dark:text-rose-400">{formatTaka(selectedInvoice.balanceAmount)}</span>
                  </div>
                </div>

                {/* Payment amount */}
                <div className="space-y-2">
                  <Label>Payment Amount (৳)</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={selectedInvoice.balanceAmount}
                  />
                  {paymentAmount && parseInt(paymentAmount, 10) > selectedInvoice.balanceAmount && (
                    <p className="text-xs text-rose-500">Amount exceeds balance due</p>
                  )}
                </div>

                {/* Payment method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  >
                    {methodOptions.map(opt => (
                      <Label
                        key={opt.value}
                        className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${
                          paymentMethod === opt.value
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <RadioGroupItem value={opt.value} />
                        {opt.icon}
                        <div className="text-xs">
                          <p className="font-medium">{opt.label}</p>
                          <p className="text-muted-foreground">{opt.labelBn}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <Label>Note (Optional)</Label>
                  <Textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={2}
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !paymentAmount ||
                    parseInt(paymentAmount, 10) <= 0 ||
                    parseInt(paymentAmount, 10) > (selectedInvoice.balanceAmount ?? 0) ||
                    isSubmitting
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Processing...' : `Collect ${paymentAmount ? formatTaka(parseInt(paymentAmount, 10)) : 'Payment'}`}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
