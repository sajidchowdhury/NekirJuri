'use client';

// ============================================================
// Fee Management Page — Tab-based: Fee Categories, Fee Structure, Invoices
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus, Receipt } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import FeeCategoryList from '@/components/finance/fee-category-list';
import FeeStructureBuilder from '@/components/finance/fee-structure-builder';
import FeeInvoiceList from '@/components/finance/fee-invoice-list';
import GenerateInvoiceWizard from '@/components/finance/generate-invoice-wizard';
import FeeInvoiceDetail from '@/components/finance/fee-invoice-detail';
import { type FeeInvoice } from '@/lib/finance/sample-data';
import { fadeIn, slideUp, staggerChildren, transitions } from '@/lib/animations';

export default function FeesPage() {
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false);
  const [invoiceDetailDialogOpen, setInvoiceDetailDialogOpen] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] = React.useState<FeeInvoice | null>(null);
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = React.useState(false);

  const handleViewInvoice = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setInvoiceDetailDialogOpen(true);
  };

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Fee Management"
        description="Manage fee categories, structures, and student invoices"
        showBismillah
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setGenerateDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Generate Invoice
            </Button>
          </div>
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
            <TabsTrigger value="categories" className="gap-1.5">
              <Receipt className="h-4 w-4 hidden sm:inline" />
              Fee Categories
            </TabsTrigger>
            <TabsTrigger value="structure" className="gap-1.5">
              Fee Structure
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5">
              Invoices
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Fee Categories */}
          <TabsContent value="categories">
            <motion.div
              initial={staggerChildren.initial}
              animate={staggerChildren.animate}
            >
              <FeeCategoryList
                onAddCategory={() => setAddCategoryDialogOpen(true)}
              />
            </motion.div>
          </TabsContent>

          {/* Tab 2: Fee Structure */}
          <TabsContent value="structure">
            <FeeStructureBuilder />
          </TabsContent>

          {/* Tab 3: Invoices */}
          <TabsContent value="invoices">
            <FeeInvoiceList
              onViewInvoice={handleViewInvoice}
              onGenerateInvoice={() => setGenerateDialogOpen(true)}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Generate Invoice Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invoices</DialogTitle>
            <DialogDescription>
              Create fee invoices for students based on the fee structure
            </DialogDescription>
          </DialogHeader>
          <GenerateInvoiceWizard
            onComplete={() => setGenerateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={invoiceDetailDialogOpen} onOpenChange={setInvoiceDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoiceNo || 'Loading...'}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <FeeInvoiceDetail
              invoice={selectedInvoice}
              onClose={() => setInvoiceDetailDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog (simple placeholder) */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Fee Category</DialogTitle>
            <DialogDescription>
              Create a new fee category for the institution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Fee category creation form will be available in the next update.
              For now, categories are managed from the fee structure builder.
            </p>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setAddCategoryDialogOpen(false)}
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
