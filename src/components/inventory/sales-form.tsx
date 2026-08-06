'use client';

// ============================================================
// SalesForm — Create a sale with line items, react-hook-form + zod
// Fetches real products from API, submits real sale to API
// ============================================================

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatTaka } from '@/lib/inventory/sample-data';

// ==================== Types ====================

interface ApiProduct {
  id: number;
  name: string;
  code: string;
  salePrice: number;
  currentStock: number;
  unit?: string | null;
  category?: { id: number; name: string; code: string };
}

// ==================== Schema ====================

const saleLineItemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  productName: z.string(),
  quantity: z.coerce.number().min(1, 'Min 1'),
  unitPrice: z.coerce.number().min(0, 'Must be >= 0'),
  total: z.coerce.number(),
  maxStock: z.coerce.number(),
});

const saleSchema = z.object({
  invoiceNo: z.string().min(1, 'Invoice number is required'),
  saleDate: z.string().min(1, 'Sale date is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  discount: z.coerce.number().min(0, 'Must be >= 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  items: z.array(saleLineItemSchema).min(1, 'At least one item is required'),
});

type SaleFormData = z.infer<typeof saleSchema>;

// ==================== Invoice Number Generator ====================

function generateInvoiceNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `SL-${year}${month}-${random}`;
}

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// ==================== Component ====================

export interface SalesFormProps {
  onSubmit: (data: SaleFormData) => Promise<void>;
  onCancel: () => void;
}

export default function SalesForm({ onSubmit, onCancel }: SalesFormProps) {
  const [products, setProducts] = React.useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);
  const [productsError, setProductsError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch products from API on mount
  React.useEffect(() => {
    async function fetchProducts() {
      try {
        setProductsLoading(true);
        const res = await fetch('/api/products?isActive=true&limit=200');
        if (!res.ok) throw new Error('Failed to load products');
        const json = await res.json();
        // Handle both paginated and direct array responses
        const items = Array.isArray(json) ? json : (json.data || []);
        setProducts(items);
      } catch (err) {
        console.error('[SalesForm] Failed to fetch products:', err);
        setProductsError('Could not load products. Please try again.');
      } finally {
        setProductsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      invoiceNo: generateInvoiceNo(),
      saleDate: getTodayDate(),
      customerName: 'Walk-in Customer',
      customerPhone: '',
      discount: 0,
      paymentMethod: 'Cash',
      items: [{ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const watchedItems = form.watch('items');
  const watchedDiscount = form.watch('discount');

  const subtotal = React.useMemo(
    () => watchedItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
    [watchedItems]
  );
  const grandTotal = Math.max(0, subtotal - watchedDiscount);

  // Check if any item exceeds stock
  const stockWarnings = React.useMemo(() => {
    const warnings: Record<number, boolean> = {};
    watchedItems.forEach((item, idx) => {
      if (item.maxStock > 0 && item.quantity > item.maxStock) {
        warnings[idx] = true;
      }
    });
    return warnings;
  }, [watchedItems]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => String(p.id) === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, String(product.id));
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, Number(product.salePrice));
      form.setValue(`items.${index}.maxStock`, Number(product.currentStock));
      // Recalculate total
      const qty = form.getValues(`items.${index}.quantity`) || 1;
      form.setValue(`items.${index}.total`, qty * Number(product.salePrice));
      // Reset quantity to 1 if it exceeds stock
      if (qty > Number(product.currentStock) && Number(product.currentStock) > 0) {
        form.setValue(`items.${index}.quantity`, 1);
      }
    }
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const price = form.getValues(`items.${index}.unitPrice`);
    form.setValue(`items.${index}.total`, qty * price);
  };

  const handlePriceChange = (index: number, price: number) => {
    const qty = form.getValues(`items.${index}.quantity`);
    form.setValue(`items.${index}.total`, qty * price);
  };

  const handleSubmitForm = async (data: SaleFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
    } catch (err) {
      console.error('[SalesForm] Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || productsLoading;

  return (
    <form className="space-y-4">
      {/* Invoice & Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Invoice No</Label>
          <Input {...form.register('invoiceNo')} placeholder="SL-202506-0001" className="font-mono" />
          {form.formState.errors.invoiceNo && (
            <p className="text-xs text-rose-500">{form.formState.errors.invoiceNo.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Sale Date</Label>
          <Input type="date" {...form.register('saleDate')} />
          {form.formState.errors.saleDate && (
            <p className="text-xs text-rose-500">{form.formState.errors.saleDate.message}</p>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Customer Name</Label>
          <Input {...form.register('customerName')} placeholder="Walk-in Customer" disabled={isDisabled} />
          {form.formState.errors.customerName && (
            <p className="text-xs text-rose-500">{form.formState.errors.customerName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Phone (optional)</Label>
          <Input {...form.register('customerPhone')} placeholder="01XXXXXXXXX" disabled={isDisabled} />
        </div>
      </div>

      <Separator />

      {/* Line Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Line Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={() => append({ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 })}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        {/* Products loading state */}
        {productsLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading products...
          </div>
        )}

        {/* Products error state */}
        {productsError && !productsLoading && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-3 text-sm text-rose-600 dark:text-rose-400">
            {productsError}
          </div>
        )}

        {/* No products available */}
        {!productsLoading && !productsError && products.length === 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-600 dark:text-amber-400">
            No active products found. Please add products first.
          </div>
        )}

        {!productsLoading && !productsError && fields.map((field, index) => {
          const maxStock = watchedItems[index]?.maxStock ?? 0;
          const hasStockWarning = stockWarnings[index];
          return (
            <div key={field.id} className={`rounded-lg border p-3 space-y-2 ${hasStockWarning ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20' : 'border-border'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                <div className="flex items-center gap-2">
                  {hasStockWarning && (
                    <span className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-3 w-3" />
                      Exceeds stock
                    </span>
                  )}
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => remove(index)} disabled={submitting}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <Label className="text-xs">Product</Label>
                  <Select
                    value={form.watch(`items.${index}.productId`)}
                    onValueChange={(v) => handleProductSelect(index, v)}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} (Stock: {Number(p.currentStock)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.items?.[index]?.productId && (
                    <p className="text-xs text-rose-500">{form.formState.errors.items[index]?.productId?.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    Qty {maxStock > 0 ? <span className="text-muted-foreground">(max: {maxStock})</span> : ''}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={maxStock || undefined}
                    className={`h-8 text-xs ${hasStockWarning ? 'border-rose-300 dark:border-rose-700' : ''}`}
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    disabled={isDisabled}
                    onChange={(e) => {
                      const raw = Number(e.target.value);
                      const val = maxStock > 0 ? Math.min(raw, maxStock) : raw;
                      form.setValue(`items.${index}.quantity`, val, { shouldValidate: true });
                      handleQuantityChange(index, val);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Unit Price (৳)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-8 text-xs"
                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    disabled={isDisabled}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      form.setValue(`items.${index}.unitPrice`, val, { shouldValidate: true });
                      handlePriceChange(index, val);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Total</Label>
                  <div className="flex h-8 items-center px-2 rounded-md border border-border bg-muted/50 text-xs font-medium">
                    {formatTaka((watchedItems[index]?.quantity ?? 0) * (watchedItems[index]?.unitPrice ?? 0))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Footer: Totals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatTaka(subtotal)}</span>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Discount (৳)</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            className="h-8 text-xs max-w-32"
            {...form.register('discount', { valueAsNumber: true })}
            disabled={isDisabled}
          />
          {watchedDiscount > subtotal && (
            <p className="text-xs text-rose-500">Discount cannot exceed subtotal</p>
          )}
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Grand Total</span>
          <span className="text-amber-600 dark:text-amber-400">{formatTaka(grandTotal)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-1.5">
        <Label>Payment Method</Label>
        <Select
          value={form.watch('paymentMethod')}
          onValueChange={(v) => form.setValue('paymentMethod', v)}
          disabled={isDisabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="bKash">bKash</SelectItem>
            <SelectItem value="Bank">Bank</SelectItem>
            <SelectItem value="Credit">Credit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm" disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700"
          size="sm"
          disabled={isDisabled || Object.keys(stockWarnings).length > 0 || watchedDiscount > subtotal}
          onClick={() => form.handleSubmit(handleSubmitForm)()}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              Processing...
            </>
          ) : (
            'Complete Sale'
          )}
        </Button>
      </div>
    </form>
  );
}
