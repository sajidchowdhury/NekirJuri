'use client';

// ============================================================
// Fee Collections Page — Collect Payment + Collection Report + Recent Collections
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Percent, Receipt, Eye, Calendar, CreditCard
} from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/atoms/page-header';
import CollectPaymentForm from '@/components/finance/collect-payment-form';
import CollectionReport from '@/components/finance/collection-report';
import PaymentReceipt from '@/components/finance/payment-receipt';
import FeeDiscountForm from '@/components/finance/fee-discount-form';
import { DataTable } from '@/components/organisms/data-table';
import {
  type CollectionRecord,
  type PaymentMethod,
  sampleCollections,
  formatTaka,
} from '@/lib/finance/sample-data';
import { fadeIn, slideUp, staggerChildren, transitions } from '@/lib/animations';

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash / নগদ',
  bkash: 'bKash / বিকাশ',
  bank: 'Bank / ব্যাংক',
  cheque: 'Cheque / চেক',
};

const methodColors: Record<PaymentMethod, string> = {
  cash: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  bkash: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  bank: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  cheque: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
};

export default function CollectionsPage() {
  const [discountDialogOpen, setDiscountDialogOpen] = React.useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState<CollectionRecord | null>(null);

  const handleViewReceipt = (collection: CollectionRecord) => {
    setSelectedCollection(collection);
    setReceiptDialogOpen(true);
  };

  // Recent Collections table columns
  const columns: ColumnDef<CollectionRecord, unknown>[] = [
    {
      accessorKey: 'receiptNo',
      header: 'Receipt #',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          {row.original.receiptNo}
        </span>
      ),
    },
    {
      accessorKey: 'studentName',
      header: 'Student',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{row.original.studentName}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.studentNameBn}</p>
        </div>
      ),
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-normal">{row.original.className}</Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {formatTaka(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => (
        <Badge variant="secondary" className={`text-xs px-1.5 ${methodColors[row.original.method]}`}>
          {methodLabels[row.original.method].split('/')[0].trim()}
        </Badge>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.date}</span>
      ),
    },
    {
      accessorKey: 'invoiceNo',
      header: 'Invoice',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.invoiceNo}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleViewReceipt(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Fee Collections"
        description="Collect payments, view receipts, and manage discounts"
        showBismillah
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setDiscountDialogOpen(true)}
              className="gap-1.5"
              size="sm"
            >
              <Percent className="h-4 w-4" />
              Apply Discount
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Collect Payment Form */}
        <motion.div
          initial={slideUp.initial}
          animate={slideUp.animate}
          transition={transitions.normal}
          className="lg:col-span-1"
        >
          <Card className="border-t-[3px] border-t-emerald-600 dark:border-t-emerald-400">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                Collect Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CollectPaymentForm />
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Tabs — Collection Report + Recent Collections */}
        <motion.div
          initial={slideUp.initial}
          animate={slideUp.animate}
          transition={{ ...transitions.normal, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Tabs defaultValue="report" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="report" className="gap-1.5">
                <Calendar className="h-4 w-4 hidden sm:inline" />
                Collection Report
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-1.5">
                <Receipt className="h-4 w-4 hidden sm:inline" />
                Recent Collections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report">
              <CollectionReport />
            </TabsContent>

            <TabsContent value="recent">
              <motion.div
                initial={staggerChildren.initial}
                animate={staggerChildren.animate}
              >
                <DataTable
                  columns={columns}
                  data={sampleCollections}
                  searchable
                  searchPlaceholder="Search collections..."
                  sortable
                  paginated
                  pageSize={10}
                  renderCard={(col: CollectionRecord) => (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {col.receiptNo}
                        </span>
                        <Badge variant="secondary" className={`text-xs px-1.5 ${methodColors[col.method]}`}>
                          {methodLabels[col.method].split('/')[0].trim()}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{col.studentName}</p>
                      <p className="text-xs text-muted-foreground">{col.studentNameBn} • {col.className}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{formatTaka(col.amount)}</span>
                        <span className="text-xs text-muted-foreground">{col.date}</span>
                      </div>
                    </div>
                  )}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Discount Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply Fee Discount</DialogTitle>
            <DialogDescription>
              Apply percentage or flat discount to student invoices
            </DialogDescription>
          </DialogHeader>
          <FeeDiscountForm
            onSuccess={() => setDiscountDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Receipt Preview Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt preview — print or download
            </DialogDescription>
          </DialogHeader>
          {selectedCollection && (
            <PaymentReceipt
              receiptNo={selectedCollection.receiptNo}
              date={selectedCollection.date}
              studentName={selectedCollection.studentName}
              studentNameBn={selectedCollection.studentNameBn}
              className={selectedCollection.className}
              amount={selectedCollection.amount}
              method={selectedCollection.method}
              invoiceNo={selectedCollection.invoiceNo}
              receivedBy="Ustad Karim"
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
