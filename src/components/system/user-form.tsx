'use client';

// ============================================================
// UserForm — Add/Edit user form with react-hook-form + zod
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type SystemUser,
  type UserRole,
  type ModuleName,
} from '@/lib/system/sample-data';

const userFormSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['Super Admin', 'Admin', 'Teacher', 'Accountant', 'Staff', 'Viewer']),
  status: z.enum(['Active', 'Inactive']),
  password: z.string().optional(),
  modules: z.array(z.string()).min(1, 'At least one module is required'),
});

type UserFormData = z.infer<typeof userFormSchema>;

const roles: UserRole[] = ['Super Admin', 'Admin', 'Teacher', 'Accountant', 'Staff', 'Viewer'];
const modules: ModuleName[] = ['Academic', 'Finance', 'Inventory', 'Accounting', 'Website', 'System'];

interface UserFormProps {
  user?: SystemUser | null;
  onSave?: (data: UserFormData) => void;
  onCancel?: () => void;
}

export default function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(
      isEditing
        ? userFormSchema
        : userFormSchema.extend({
            password: z.string().min(8, 'Password must be at least 8 characters'),
          })
    ),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'Staff',
      status: user?.status || 'Active',
      password: '',
      modules: user?.modules || ['Academic'],
    },
  });

  const watchedModules = form.watch('modules');

  const handleModuleToggle = (module: ModuleName, checked: boolean) => {
    const current = form.getValues('modules');
    if (checked) {
      form.setValue('modules', [...current, module]);
    } else {
      form.setValue('modules', current.filter((m) => m !== module));
    }
  };

  const onSubmit = (data: UserFormData) => {
    onSave?.(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name <span className="text-rose-500">*</span></Label>
        <Input
          id="name"
          placeholder="Enter full name"
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-xs text-rose-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-rose-500">*</span></Label>
        <Input
          id="email"
          type="email"
          placeholder="user@alhuda.edu.bd"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-rose-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="+880 1XXX-XXXXXX"
          {...form.register('phone')}
        />
      </div>

      {/* Role & Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={form.watch('role')}
            onValueChange={(val) => form.setValue('role', val as UserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(val) => form.setValue('status', val as 'Active' | 'Inactive')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Password (new users only) */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Password <span className="text-rose-500">*</span></Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-rose-500">{form.formState.errors.password.message}</p>
          )}
        </div>
      )}

      {/* Assign Modules */}
      <div className="space-y-3">
        <Label>Assign Modules <span className="text-rose-500">*</span></Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {modules.map((module) => (
            <label
              key={module}
              className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={watchedModules.includes(module)}
                onCheckedChange={(checked) => handleModuleToggle(module, !!checked)}
              />
              <span className="text-sm">{module}</span>
            </label>
          ))}
        </div>
        {form.formState.errors.modules && (
          <p className="text-xs text-rose-500">{form.formState.errors.modules.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isEditing ? 'Update User' : 'Save User'}
        </Button>
      </div>
    </form>
  );
}
