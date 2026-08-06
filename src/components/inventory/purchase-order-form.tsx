'use client';

// ============================================================
// PurchaseOrderForm — Add/Edit purchase order with line items
// ============================================================

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type PurchaseOrder,
  type Product,
  formatTaka,
  sampleProducts,
} from '@/lib/inventory/sample-data';

const lineItemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  productName: z.string(),
  quantity: z.coerce.number().min(1, 'Min 1'),
  unitPrice: z.coerce.number().min(0, 'Must be >= 0'),
  total: z.coerce.number(),
});

const poSchema = z.object({
  supplierName: z.string().min(1, 'Supplier name is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  expectedDeliveryDate: z.string().min(1, 'Expected date is required'),
  notes: z.string().optional(),
  taxPercent: z.coerce.number().min(0).max(100),
  shipping: z.coerce.number().min(0),
  items: z.array(lineItemSchema).min(1, 'At least one item is required'),
});

type POFormData = z.infer<typeof poSchema>;

export interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onSubmit: (data: POFormData, action: 'draft' | 'order') => void;
  onCancel: () => void;
}

export default function PurchaseOrderForm({ purchaseOrder, onSubmit, onCancel }: PurchaseOrderFormProps) {
  const form = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      supplierName: purchaseOrder?.supplierName ?? '',
      orderDate: purchaseOrder?.orderDate ?? new Date().toISOString().split('T')[0],
      expectedDeliveryDate: purchaseOrder?.expectedDeliveryDate ?? '',
      notes: purchaseOrder?.notes ?? '',
      taxPercent: purchaseOrder?.taxPercent ?? 0,
      shipping: purchaseOrder?.shipping ?? 0,
      items: purchaseOrder?.items?.map(i => ({ ...i })) ?? [{ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const watchedItems = form.watch('items');
  const watchedTax = form.watch('taxPercent');
  const watchedShipping = form.watch('shipping');

  const subtotal = React.useMemo(() => watchedItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0), [watchedItems]);
  const taxAmount = (subtotal * watchedTax) / 100;
  const grandTotal = subtotal + taxAmount + watchedShipping;

  const handleProductSelect = (index: number, productId: string) => {
    const product: Product | undefined = sampleProducts.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.productId`, product.id);
      form.setValue(`items.${index}.productName`, product.name);
      form.setValue(`items.${index}.unitPrice`, product.purchasePrice);
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
      {/* Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Supplier Name *</Label>
          <Input {...form.register('supplierName')} placeholder="Enter supplier name" />
          {form.formState.errors.supplierName && (
            <p className="text-xs text-rose-500">{form.formState.errors.supplierName.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Order Date *</Label>
          <Input type="date" {...form.register('orderDate')} />
        </div>
        <div className="space-y-1.5">
          <Label>Expected Delivery Date *</Label>
          <Input type="date" {...form.register('expectedDeliveryDate')} />
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea {...form.register('notes')} placeholder="Order notes..." rows={2} />
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
            onClick={() => append({ productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 })}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        {fields.map((field, index) => (
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
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  className="h-8 text-xs"
                  {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                  onChange={(e) => {
                    form.setValue(`items.${index}.quantity`, Number(e.target.value), { shouldValidate: true });
                    handleQuantityChange(index, Number(e.target.value));
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
        ))}
      </div>

      <Separator />

      {/* Footer: Totals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatTaka(subtotal)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Tax (%)</Label>
            <Input type="number" min={0} max={100} className="h-8 text-xs" {...form.register('taxPercent', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Shipping (৳)</Label>
            <Input type="number" min={0} className="h-8 text-xs" {...form.register('shipping', { valueAsNumber: true })} />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tax Amount</span>
          <span>{formatTaka(taxAmount)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Grand Total</span>
          <span className="text-amber-600 dark:text-amber-400">{formatTaka(grandTotal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => form.handleSubmit((data) => onSubmit(data, 'draft'))()}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700"
          size="sm"
          onClick={() => form.handleSubmit((data) => onSubmit(data, 'order'))()}
        >
          Submit Order
        </Button>
      </div>
    </form>
  );
}
