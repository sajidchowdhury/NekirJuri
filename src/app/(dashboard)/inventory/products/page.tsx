'use client';

// ============================================================
// Product Management Page — ProductList with add/edit dialog
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ProductList from '@/components/inventory/product-list';
import ProductForm from '@/components/inventory/product-form';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

// ── API Product type (matches what ProductList uses) ─────
interface ApiProduct {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  unit?: string | null;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number | null;
  hasExpiry?: boolean;
  isActive: boolean;
  categoryId: number;
  category: { id: number; name: string; code: string };
  createdAt: string;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<ApiProduct | null>(null);
  const [filter, setFilter] = React.useState('all');

  const handleEdit = (product: ApiProduct) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedProduct(null);
    queryClient.invalidateQueries({ queryKey: ['products'] });
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
            onSubmit={() => handleFormSuccess()}
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
            product={selectedProduct ? {
              id: String(selectedProduct.id),
              name: selectedProduct.name,
              category: (selectedProduct.category?.name || 'Misc') as 'Stationery' | 'Books' | 'Uniform' | 'Food' | 'Cleaning' | 'Furniture' | 'Electronics' | 'Misc',
              sku: selectedProduct.code,
              purchasePrice: Number(selectedProduct.purchasePrice),
              salePrice: Number(selectedProduct.salePrice),
              currentStock: selectedProduct.currentStock,
              minStockLevel: selectedProduct.minStockLevel,
              maxStockLevel: selectedProduct.maxStockLevel || 0,
              unit: (selectedProduct.unit || 'Piece') as 'Piece' | 'Kg' | 'Liter' | 'Box' | 'Pack' | 'Dozen' | 'Set',
              description: selectedProduct.description || undefined,
            } : undefined}
            onSubmit={() => handleFormSuccess()}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
