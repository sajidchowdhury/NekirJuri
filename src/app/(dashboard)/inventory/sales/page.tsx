'use client';

// ============================================================
// Sales Management Page — SalesList with new sale dialog
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import SalesList from '@/components/inventory/sales-list';
import SalesForm from '@/components/inventory/sales-form';
import {
  type Sale,
  formatTaka,
  saleStatusClasses,
  paymentMethodClasses,
} from '@/lib/inventory/sample-data';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function SalesPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setViewDialogOpen(true);
  };

  const handlePrint = (_sale: Sale) => {
    // In a real app, this would open print view
  };

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Sales Management"
        description="Track sales transactions and manage invoices"

        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Sale
            </Button>
          </div>
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <SalesList
          onView={handleView}
          onPrint={handlePrint}
        />
      </motion.div>

      {/* New Sale Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Sale</DialogTitle>
            <DialogDescription>
              Create a new sales transaction
            </DialogDescription>
          </DialogHeader>
          <SalesForm
            onSubmit={() => setAddDialogOpen(false)}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Sale Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>
              {selectedSale?.invoiceNo || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{selectedSale.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{new Date(selectedSale.date).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-0.5">
                    <Badge variant="secondary" className={`${saleStatusClasses[selectedSale.status].bg} ${saleStatusClasses[selectedSale.status].text} gap-1`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${saleStatusClasses[selectedSale.status].dot}`} />
                      {saleStatusClasses[selectedSale.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment:</span>
                  <div className="mt-0.5">
                    <Badge variant="secondary" className={`${paymentMethodClasses[selectedSale.paymentMethod].bg} ${paymentMethodClasses[selectedSale.paymentMethod].text} gap-1`}>
                      {selectedSale.paymentMethod}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line Items */}
              <div>
                <p className="text-sm font-semibold mb-2">Items</p>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Product</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Unit Price</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">{item.productName}</td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">{formatTaka(item.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatTaka(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatTaka(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-rose-600">-{formatTaka(selectedSale.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Grand Total</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatTaka(selectedSale.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
