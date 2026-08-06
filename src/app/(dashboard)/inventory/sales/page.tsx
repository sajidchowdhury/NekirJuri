'use client';

// ============================================================
// Sales Management Page — SalesList with new sale dialog
// Real API integration for creating and listing sales
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import SalesList from '@/components/inventory/sales-list';
import SalesForm from '@/components/inventory/sales-form';
import {
  type SaleStatus,
  type PaymentMethod,
  formatTaka,
  saleStatusClasses,
  paymentMethodClasses,
} from '@/lib/inventory/sample-data';
import { fadeIn, slideUp, transitions } from '@/lib/animations';
import type { ApiSale } from '@/components/inventory/sales-list';

// ==================== SaleFormData type (matches SalesForm schema) ====================

interface SaleFormData {
  invoiceNo: string;
  saleDate: string;
  customerName: string;
  customerPhone?: string;
  discount: number;
  paymentMethod: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    maxStock: number;
  }[];
}

export default function SalesPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<ApiSale | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleView = (sale: ApiSale) => {
    setSelectedSale(sale);
    setViewDialogOpen(true);
  };

  const handlePrint = (_sale: ApiSale) => {
    // In a real app, this would open print view
    toast.info('Print feature coming soon');
  };

  // Submit sale to API
  const handleSubmitSale = async (data: SaleFormData) => {
    const payload = {
      invoiceNo: data.invoiceNo,
      customerName: data.customerName,
      saleDate: data.saleDate,
      discountAmount: data.discount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'Credit' ? 'unpaid' : 'paid',
      status: 'completed',
      items: data.items.map(item => ({
        productId: Number(item.productId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Failed to create sale');
    }

    // Success
    toast.success('Sale created successfully', {
      description: `Invoice ${data.invoiceNo} — ${formatTaka(data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) - data.discount)}`,
    });

    setAddDialogOpen(false);
    setRefreshKey(prev => prev + 1); // Refresh the list
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
          refreshKey={refreshKey}
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
            onSubmit={handleSubmitSale}
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
                  <p className="font-medium">{selectedSale.customerName || selectedSale.student?.name || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{new Date(selectedSale.saleDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-0.5">
                    <Badge variant="secondary" className={`${saleStatusClasses[selectedSale.status as SaleStatus]?.bg || ''} ${saleStatusClasses[selectedSale.status as SaleStatus]?.text || ''} gap-1`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${saleStatusClasses[selectedSale.status as SaleStatus]?.dot || ''}`} />
                      {saleStatusClasses[selectedSale.status as SaleStatus]?.label || selectedSale.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment:</span>
                  <div className="mt-0.5">
                    <Badge variant="secondary" className={`${paymentMethodClasses[selectedSale.paymentMethod as PaymentMethod]?.bg || ''} ${paymentMethodClasses[selectedSale.paymentMethod as PaymentMethod]?.text || ''} gap-1`}>
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
                      {selectedSale.salesItems?.map((item) => (
                        <tr key={item.id} className="border-t border-border">
                          <td className="px-3 py-2">{item.product?.name || '—'}</td>
                          <td className="px-3 py-2 text-right">{Number(item.quantity)}</td>
                          <td className="px-3 py-2 text-right">{formatTaka(Number(item.unitPrice))}</td>
                          <td className="px-3 py-2 text-right font-medium">{formatTaka(Number(item.totalPrice))}</td>
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
                  <span>{formatTaka(Number(selectedSale.totalAmount))}</span>
                </div>
                {Number(selectedSale.discountAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-rose-600">-{formatTaka(Number(selectedSale.discountAmount))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Grand Total</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatTaka(Number(selectedSale.netAmount))}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
