'use client';

// ============================================================
// Purchase Order Management Page — PurchaseOrderList with add/edit/view dialogs
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import PurchaseOrderList from '@/components/inventory/purchase-order-list';
import PurchaseOrderForm from '@/components/inventory/purchase-order-form';
import {
  type PurchaseOrder,
  formatTaka,
  poStatusClasses,
} from '@/lib/inventory/sample-data';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function PurchasesPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedPO, setSelectedPO] = React.useState<PurchaseOrder | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('all');

  const handleView = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewDialogOpen(true);
  };

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setEditDialogOpen(true);
  };

  const handleReceive = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setViewDialogOpen(true);
  };

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Draft' },
    { key: 'ordered', label: 'Ordered' },
    { key: 'partially-received', label: 'Partial' },
    { key: 'received', label: 'Received' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Purchase Orders"
        description="Track purchases, suppliers, and manage purchase orders"

        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              New Purchase Order
            </Button>
          </div>
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
        className="space-y-4"
      >
        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map(sf => (
            <Button
              key={sf.key}
              variant={statusFilter === sf.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(sf.key)}
              className={statusFilter === sf.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {sf.label}
            </Button>
          ))}
        </div>

        {/* PO List */}
        <PurchaseOrderList
          statusFilter={statusFilter}
          onView={handleView}
          onEdit={handleEdit}
          onReceive={handleReceive}
        />
      </motion.div>

      {/* Add PO Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order for inventory procurement
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            onSubmit={() => setAddDialogOpen(false)}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit PO Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purchase Order</DialogTitle>
            <DialogDescription>
              {selectedPO?.poNumber || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          <PurchaseOrderForm
            purchaseOrder={selectedPO}
            onSubmit={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View PO Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              {selectedPO?.poNumber || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Supplier:</span>
                  <p className="font-medium">{selectedPO.supplierName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-0.5">
                    <Badge variant="secondary" className={`${poStatusClasses[selectedPO.status].bg} ${poStatusClasses[selectedPO.status].text} gap-1`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${poStatusClasses[selectedPO.status].dot}`} />
                      {poStatusClasses[selectedPO.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Date:</span>
                  <p className="font-medium">{new Date(selectedPO.orderDate).toLocaleDateString('en-GB')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <p className="font-medium">{new Date(selectedPO.expectedDeliveryDate).toLocaleDateString('en-GB')}</p>
                </div>
              </div>

              {selectedPO.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p>{selectedPO.notes}</p>
                </div>
              )}

              <Separator />

              {/* Line Items */}
              <div>
                <p className="text-sm font-semibold mb-2">Line Items</p>
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
                      {selectedPO.items.map((item, i) => (
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
                  <span>{formatTaka(selectedPO.subtotal)}</span>
                </div>
                {selectedPO.taxPercent > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({selectedPO.taxPercent}%)</span>
                    <span>{formatTaka(selectedPO.taxAmount)}</span>
                  </div>
                )}
                {selectedPO.shipping > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{formatTaka(selectedPO.shipping)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Grand Total</span>
                  <span className="text-amber-600 dark:text-amber-400">{formatTaka(selectedPO.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
