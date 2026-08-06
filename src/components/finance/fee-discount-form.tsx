'use client';

// ============================================================
// FeeDiscountForm — Apply discount to invoice
// Select student → invoice → type → amount → reason → submit
// ============================================================

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Percent, Banknote, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  sampleInvoices,
  formatTaka,
} from '@/lib/finance/sample-data';

interface FeeDiscountFormProps {
  onSuccess?: () => void;
}

export default function FeeDiscountForm({ onSuccess }: FeeDiscountFormProps) {
  const [studentSearch, setStudentSearch] = React.useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState<string | null>(null);
  const [discountType, setDiscountType] = React.useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [approvalRef, setApprovalRef] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Get invoices matching search (non-paid only)
  const matchingInvoices = sampleInvoices.filter(inv =>
    inv.status !== 'paid' &&
    (inv.studentName.toLowerCase().includes(studentSearch.toLowerCase()) ||
     inv.studentNameBn.includes(studentSearch) ||
     inv.invoiceNo.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedInvoice = sampleInvoices.find(inv => inv.id === selectedInvoiceId);

  const discountAmount = React.useMemo(() => {
    if (!selectedInvoice || !discountValue) return 0;
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) return 0;
    if (discountType === 'percentage') {
      return Math.round((val / 100) * selectedInvoice.balanceAmount);
    }
    return val;
  }, [selectedInvoice, discountType, discountValue]);

  const afterDiscount = selectedInvoice ? selectedInvoice.balanceAmount - discountAmount : 0;

  const handleSubmit = async () => {
    if (!selectedInvoice || discountAmount <= 0) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    onSuccess?.();
  };

  const resetForm = () => {
    setStudentSearch('');
    setSelectedInvoiceId(null);
    setDiscountType('percentage');
    setDiscountValue('');
    setReason('');
    setApprovalRef('');
    setIsSuccess(false);
  };

  if (isSuccess && selectedInvoice) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Discount Applied Successfully!</h3>
            <p className="text-sm text-muted-foreground">
              {formatTaka(discountAmount)} discount on {selectedInvoice.invoiceNo}
            </p>
            <Button onClick={resetForm} className="bg-emerald-600 hover:bg-emerald-700 mt-2">
              Apply Another Discount
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Student & Invoice */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Select Invoice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or invoice #..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {studentSearch && matchingInvoices.length > 0 && (
            <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
              {matchingInvoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => setSelectedInvoiceId(inv.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors text-left ${
                    selectedInvoiceId === inv.id ? 'bg-emerald-50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-600' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{inv.studentName}</p>
                    <p className="text-xs text-muted-foreground">{inv.invoiceNo} • Balance: {formatTaka(inv.balanceAmount)}</p>
                  </div>
                  <StatusBadge status={inv.status === 'partial' ? 'partial' : 'overdue'} />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Details */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Discount Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Discount type */}
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <RadioGroup
                    value={discountType}
                    onValueChange={(val) => {
                      setDiscountType(val as 'percentage' | 'flat');
                      setDiscountValue('');
                    }}
                    className="flex gap-4"
                  >
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="percentage" />
                      <Percent className="h-4 w-4 text-amber-600" />
                      <span className="text-sm">Percentage (%)</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <RadioGroupItem value="flat" />
                      <Banknote className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Flat Amount (৳)</span>
                    </Label>
                  </RadioGroup>
                </div>

                {/* Discount value */}
                <div className="space-y-2">
                  <Label>
                    {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (৳)'}
                  </Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === 'percentage' ? 'e.g., 10' : 'e.g., 500'}
                    max={discountType === 'percentage' ? 100 : selectedInvoice.balanceAmount}
                  />
                </div>

                {/* Before/After comparison */}
                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Balance</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{formatTaka(selectedInvoice.balanceAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">- {formatTaka(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-2">
                    <span>After Discount</span>
                    <span className={`font-bold ${afterDiscount >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {formatTaka(Math.max(0, afterDiscount))}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Sibling discount, Financial hardship, Early payment..."
                    rows={2}
                  />
                </div>

                {/* Approval reference */}
                <div className="space-y-2">
                  <Label>Approval Reference (Optional)</Label>
                  <Input
                    value={approvalRef}
                    onChange={(e) => setApprovalRef(e.target.value)}
                    placeholder="e.g., PRINCIPAL-2025-001"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={discountAmount <= 0 || afterDiscount < 0 || isSubmitting || !reason}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? 'Applying...' : 'Apply Discount'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
