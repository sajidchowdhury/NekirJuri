'use client';

// ============================================================
// ProductForm — Add/Edit product form with react-hook-form + zod
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  type Product,
  type ProductCategory,
  type ProductUnit,
  generateSKU,
} from '@/lib/inventory/sample-data';

const categories: ProductCategory[] = ['Stationery', 'Books', 'Uniform', 'Food', 'Cleaning', 'Furniture', 'Electronics', 'Misc'];
const units: ProductUnit[] = ['Piece', 'Kg', 'Liter', 'Box', 'Pack', 'Dozen', 'Set'];

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required'),
  purchasePrice: z.coerce.number().min(0, 'Must be >= 0'),
  salePrice: z.coerce.number().min(0, 'Must be >= 0'),
  currentStock: z.coerce.number().min(0, 'Must be >= 0'),
  minStockLevel: z.coerce.number().min(0, 'Must be >= 0'),
  maxStockLevel: z.coerce.number().min(0, 'Must be >= 0'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      category: product?.category ?? '',
      sku: product?.sku ?? '',
      purchasePrice: product?.purchasePrice ?? 0,
      salePrice: product?.salePrice ?? 0,
      currentStock: product?.currentStock ?? 0,
      minStockLevel: product?.minStockLevel ?? 5,
      maxStockLevel: product?.maxStockLevel ?? 100,
      unit: product?.unit ?? 'Piece',
      description: product?.description ?? '',
    },
  });

  const watchedCategory = form.watch('category');

  const handleGenerateSKU = () => {
    if (watchedCategory) {
      form.setValue('sku', generateSKU(watchedCategory as ProductCategory));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Product Name *</Label>
        <Input id="name" {...form.register('name')} placeholder="Enter product name" />
        {form.formState.errors.name && (
          <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Category + SKU */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select value={form.watch('category')} onValueChange={(v) => form.setValue('category', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-xs text-rose-500">{form.formState.errors.category.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>SKU</Label>
          <div className="flex gap-1.5">
            <Input {...form.register('sku')} placeholder="SKU code" className="font-mono" />
            <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={handleGenerateSKU}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Purchase Price + Sale Price */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Purchase Price (৳)</Label>
          <Input type="number" {...form.register('purchasePrice')} placeholder="0" min={0} />
        </div>
        <div className="space-y-1.5">
          <Label>Sale Price (৳)</Label>
          <Input type="number" {...form.register('salePrice')} placeholder="0" min={0} />
        </div>
      </div>

      {/* Stock levels */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Current Stock</Label>
          <Input type="number" {...form.register('currentStock')} placeholder="0" min={0} />
        </div>
        <div className="space-y-1.5">
          <Label>Min Stock Level</Label>
          <Input type="number" {...form.register('minStockLevel')} placeholder="0" min={0} />
        </div>
        <div className="space-y-1.5">
          <Label>Max Stock Level</Label>
          <Input type="number" {...form.register('maxStockLevel')} placeholder="0" min={0} />
        </div>
      </div>

      {/* Unit */}
      <div className="space-y-1.5">
        <Label>Unit *</Label>
        <Select value={form.watch('unit')} onValueChange={(v) => form.setValue('unit', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map(u => (
              <SelectItem key={u} value={u}>{u}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label>Description (optional)</Label>
        <Textarea {...form.register('description')} placeholder="Product description..." rows={3} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" size="sm">
          {product ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
