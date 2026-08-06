'use client';

// ============================================================
// Product Management Page — ProductList with add/edit dialog
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ProductList from '@/components/inventory/product-list';
import ProductForm from '@/components/inventory/product-form';
import { type Product } from '@/lib/inventory/sample-data';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function ProductsPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [filter, setFilter] = React.useState('all');

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleDelete = (_product: Product) => {
    // In a real app, this would call an API
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'low-stock', label: 'Low Stock' },
    { key: 'out-of-stock', label: 'Out of Stock' },
  ];

  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Product Management"
        description="Manage inventory products, categories, and stock levels"
        showBismillah
        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Product
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
        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {filterTabs.map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(tab.key)}
              className={filter === tab.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Product List */}
        <ProductList
          filter={filter}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </motion.div>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter product details to add to inventory
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={() => setAddDialogOpen(false)}
            onCancel={() => setAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSubmit={() => setEditDialogOpen(false)}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
