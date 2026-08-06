'use client';

// ============================================================
// SalesForm — Create a sale with line items, react-hook-form + zod
// ============================================================

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
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
import {
  type PaymentMethod,
  type Product,
  formatTaka,
  sampleProducts,
} from '@/lib/inventory/sample-data';

const saleLineItemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  productName: z.string(),
  quantity: z.coerce.number().min(1, 'Min 1'),
  unitPrice: z.coerce.number().min(0, 'Must be >= 0'),
  total: z.coerce.number(),
  maxStock: z.coerce.number(),
});

const saleSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().optional(),
  discount: z.coerce.number().min(0, 'Must be >= 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  items: z.array(saleLineItemSchema).min(1, 'At least one item is required'),
});

type SaleFormData = z.infer<typeof saleSchema>;

export interface SalesFormProps {
  onSubmit: (data: SaleFormData) => void;
  onCancel: () => void;
}

export default function SalesForm({ onSubmit, onCancel }: SalesFormProps) {
  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
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

  const subtotal = React.useMemo(() => watchedItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0), [watchedItems]);
  const grandTotal = Math.max(0, subtotal - watchedDiscount);

  const handleProductSelect = (index: number, productId: string) => {
    const product: Product | undefined = sampleProducts.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, product.salePrice);
      form.setValue(`items.${index}.maxStock`, product.currentStock);
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

  return (
    <form className="space-y-4">
      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Customer Name</Label>
          <Input {...form.register('customerName')} placeholder="Walk-in Customer" />
          {form.formState.errors.customerName && (
            <p className="text-xs text-rose-500">{form.formState.errors.customerName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Phone (optional)</Label>
          <Input {...form.register('customerPhone')} placeholder="01XXXXXXXXX" />
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
            onClick={() => append({ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0, maxStock: 0 })}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        {fields.map((field, index) => {
          const maxStock = watchedItems[index]?.maxStock ?? 0;
          return (
            <div key={field.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-rose-600" onClick={() => remove(index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="col-span-2 sm:col-span-1 space-y-1">
                  <Label className="text-xs">Product</Label>
                  <Select
                    value={form.watch(`items.${index}.productId`)}
                    onValueChange={(v) => handleProductSelect(index, v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleProducts.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} (Stock: {p.currentStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Qty (max: {maxStock})</Label>
                  <Input
                    type="number"
                    min={1}
                    max={maxStock}
                    className="h-8 text-xs"
                    {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), maxStock || 9999);
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
                    className="h-8 text-xs"
                    {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    onChange={(e) => {
                      form.setValue(`items.${index}.unitPrice`, Number(e.target.value), { shouldValidate: true });
                      handlePriceChange(index, Number(e.target.value));
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
            className="h-8 text-xs max-w-32"
            {...form.register('discount', { valueAsNumber: true })}
          />
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
        <Select value={form.watch('paymentMethod')} onValueChange={(v) => form.setValue('paymentMethod', v)}>
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
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700"
          size="sm"
          onClick={() => form.handleSubmit(onSubmit)()}
        >
          Complete Sale
        </Button>
      </div>
    </form>
  );
}
