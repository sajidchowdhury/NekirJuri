'use client';

// ============================================================
// ProductList — DataTable of products with filter tabs
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  type ColumnDef,
} from '@tanstack/react-table';
import { Pencil, Trash2, Package, BookOpen, Shirt, UtensilsCrossed, Sparkles, Armchair, Monitor, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/organisms/data-table';
import {
  type Product,
  type ProductCategory,
  type StockStatus,
  formatTaka,
  getStockStatus,
  categoryColorClasses,
  stockStatusClasses,
  sampleProducts,
} from '@/lib/inventory/sample-data';

const categoryIcons: Record<ProductCategory, React.ElementType> = {
  Stationery: Package,
  Books: BookOpen,
  Uniform: Shirt,
  Food: UtensilsCrossed,
  Cleaning: Sparkles,
  Furniture: Armchair,
  Electronics: Monitor,
  Misc: HelpCircle,
};

export interface ProductListProps {
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  filter?: string;
}

export default function ProductList({ onEdit, onDelete, filter = 'all' }: ProductListProps) {
  const filteredProducts = React.useMemo(() => {
    if (filter === 'all') return sampleProducts;
    return sampleProducts.filter(p => getStockStatus(p) === filter);
  }, [filter]);

  const columns: ColumnDef<Product, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => {
        const product = row.original;
        const Icon = categoryIcons[product.category];
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="font-medium">{product.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.original.category;
        const colors = categoryColorClasses[cat];
        return (
          <Badge variant="secondary" className={`${colors.bg} ${colors.text} gap-1`}>
            <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {cat}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Purchase Price',
      cell: ({ row }) => (
        <span className="text-sm">{formatTaka(row.original.purchasePrice)}</span>
      ),
    },
    {
      accessorKey: 'salePrice',
      header: 'Sale Price',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(row.original.salePrice)}</span>
      ),
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.currentStock} {row.original.unit}</span>
      ),
    },
    {
      accessorKey: 'minStockLevel',
      header: 'Min Level',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.minStockLevel}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status: StockStatus = getStockStatus(row.original);
        const sc = stockStatusClasses[status];
        return (
          <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
            {sc.label}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit?.(row.original)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => onDelete?.(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [onEdit, onDelete]);

  const renderCard = React.useCallback((product: Product) => {
    const status = getStockStatus(product);
    const sc = stockStatusClasses[status];
    const catColors = categoryColorClasses[product.category];
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-start justify-between">
          <span className="font-medium">{product.name}</span>
          <Badge variant="secondary" className={`${sc.bg} ${sc.text} gap-1 text-[10px]`}>
            <span className={`h-1 w-1 rounded-full ${sc.dot}`} />
            {sc.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${catColors.bg} ${catColors.text} text-[10px]`}>
            {product.category}
          </Badge>
          <span className="font-mono text-[10px] text-muted-foreground">{product.sku}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{formatTaka(product.salePrice)}</span>
          <span className="text-xs text-muted-foreground">Stock: {product.currentStock}</span>
        </div>
      </motion.div>
    );
  }, []);

  return (
    <DataTable
      columns={columns}
      data={filteredProducts}
      searchPlaceholder="Search products..."
      renderCard={renderCard}
      pageSize={10}
    />
  );
}
