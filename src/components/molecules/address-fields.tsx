'use client';

// ============================================================
// AddressFields — Reusable address block for forms
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AddressFieldsProps {
  /** Prefix for field names (for react-hook-form register) */
  prefix?: string;
  /** Register function from react-hook-form */
  register: (name: string) => Record<string, unknown>;
  /** Errors object */
  errors?: Record<string, { message?: string }>;
  /** Additional class */
  className?: string;
}

export default function AddressFields({
  prefix = '',
  register,
  errors = {},
  className,
}: AddressFieldsProps) {
  const field = (name: string) => (prefix ? `${prefix}.${name}` : name);

  const fields = [
    { name: 'address', label: 'Address Line 1', placeholder: 'House no, Street' },
    { name: 'addressLine2', label: 'Address Line 2', placeholder: 'Area, Locality' },
    { name: 'city', label: 'City', placeholder: 'City' },
    { name: 'state', label: 'State/Province', placeholder: 'State' },
    { name: 'country', label: 'Country', placeholder: 'Country' },
    { name: 'postalCode', label: 'Postal Code', placeholder: 'Postal code' },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {fields.map((f, idx) => (
        <div
          key={f.name}
          className={cn(
            'flex flex-col gap-1.5',
            idx < 2 && 'sm:col-span-2'
          )}
        >
          <Label htmlFor={field(f.name)} className="text-sm font-medium">
            {f.label}
          </Label>
          <Input
            id={field(f.name)}
            placeholder={f.placeholder}
            {...register(field(f.name))}
            className={cn(
              errors[field(f.name)] && 'border-rose-500 focus-visible:ring-rose-500'
            )}
          />
          {errors[field(f.name)]?.message && (
            <p className="text-xs text-rose-500">{errors[field(f.name)]!.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
