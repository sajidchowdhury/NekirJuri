'use client';

// ============================================================
// ProductList — DataTable of products with filter tabs
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  type ColumnDef,
} from '@tanstack/react-table';
import { Pencil, Trash2, Package, BookOpen, Shirt, UtensilsCrossed, Sparkles, Armchair, Monitor, HelpCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/organisms/data-table';
import {
  type ProductCategory,
  type StockStatus,
  formatTaka,
  getStockStatus,
  categoryColorClasses,
  stockStatusClasses,
} from '@/lib/inventory/sample-data';
import { apiDelete } from '@/lib/api-client';

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

// ── API Product Type ────────────────────────────────────

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

export interface ProductListProps {
  onEdit?: (product: ApiProduct) => void;
  onDelete?: (product: ApiProduct) => void;
  filter?: string;
}

export default function ProductList({ onEdit, onDelete, filter = 'all' }: ProductListProps) {
  const queryClient = useQueryClient();

  // ── Fetch products from API ────────────────────────────
  const {
    data: productsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['products', filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('limit', '200');
      if (filter === 'low-stock') params.set('lowStock', 'true');
      if (filter === 'out-of-stock') {
        // out-of-stock = currentStock <= 0; API doesn't have a direct filter,
        // so we fetch all and filter client-side
      }
      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const allProducts: ApiProduct[] = productsResponse?.data || [];

  // Client-side filter for out-of-stock (API doesn't support it directly)
  const products = React.useMemo(() => {
    if (filter === 'out-of-stock') {
      return allProducts.filter(p => p.currentStock <= 0);
    }
    return allProducts;
  }, [allProducts, filter]);

  // ── Delete mutation ─────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete product');
    },
  });

  const handleDelete = (product: ApiProduct) => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(product.id);
    }
  };

  // ── Helper: map category name to ProductCategory ────────
  const mapCategory = (name: string): ProductCategory => {
    const map: Record<string, ProductCategory> = {
      'Stationery': 'Stationery',
      'Books': 'Books',
      'Uniform': 'Uniform',
      'Food': 'Food',
      'Cleaning': 'Cleaning',
      'Furniture': 'Furniture',
      'Electronics': 'Electronics',
    };
    return map[name] || 'Misc';
  };

  // ── Helper: get stock status from API product ───────────
  const getApiStockStatus = (p: ApiProduct): StockStatus => {
    if (p.currentStock <= 0) return 'out-of-stock';
    if (p.currentStock <= p.minStockLevel) return 'low-stock';
    return 'in-stock';
  };

  const columns: ColumnDef<ApiProduct, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => {
        const product = row.original;
        const cat = mapCategory(product.category?.name || '');
        const Icon = categoryIcons[cat];
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
        const cat = mapCategory(row.original.category?.name || '');
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
      accessorKey: 'code',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Purchase Price',
      cell: ({ row }) => (
        <span className="text-sm">{formatTaka(Number(row.original.purchasePrice))}</span>
      ),
    },
    {
      accessorKey: 'salePrice',
      header: 'Sale Price',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{formatTaka(Number(row.original.salePrice))}</span>
      ),
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.currentStock} {row.original.unit || 'pcs'}</span>
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
        const status = getApiStockStatus(row.original);
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const renderCard = React.useCallback((product: ApiProduct) => {
    const status = getApiStockStatus(product);
    const sc = stockStatusClasses[status];
    const cat = mapCategory(product.category?.name || '');
    const catColors = categoryColorClasses[cat];
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
            {cat}
          </Badge>
          <span className="font-mono text-[10px] text-muted-foreground">{product.code}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">{formatTaka(Number(product.salePrice))}</span>
          <span className="text-xs text-muted-foreground">Stock: {product.currentStock}</span>
        </div>
      </motion.div>
    );
  }, []);

  // ── Error state ────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-semibold">Failed to load products</h3>
        <p className="text-sm text-muted-foreground max-w-md">There was an error fetching product data. Please try again.</p>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={products}
      searchPlaceholder="Search products..."
      renderCard={renderCard}
      pageSize={10}
      isLoading={isLoading}
      emptyMessage="No products found"
      emptyDescription="Add your first product to get started."
    />
  );
}
