'use client';

// ============================================================
// SessionForm — Create/edit academic session form
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const sessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.string().optional(),
  isCurrent: z.boolean().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

export interface SessionFormProps {
  defaultValues?: Partial<SessionFormData> & { id?: number };
  onSuccess?: () => void;
  className?: string;
}

export default function SessionForm({
  defaultValues,
  onSuccess,
  className,
}: SessionFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      isCurrent: false,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true);
    try {
      const url = defaultValues?.id ? `/api/academic-sessions/${defaultValues.id}` : '/api/academic-sessions';
      const method = defaultValues?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success(defaultValues?.id ? 'Session updated' : 'Session created successfully');
      onSuccess?.();
    } catch (err) { toast.error(String(err)); } finally { setIsLoading(false); }
  };

  const fieldError = (n: keyof SessionFormData) => errors[n]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="name">Session Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. 2025-2026" className={cn(fieldError('name') && 'border-rose-500')} />
          {fieldError('name') && <p className="text-xs text-rose-500">{fieldError('name')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input id="startDate" type="date" {...register('startDate')} className={cn(fieldError('startDate') && 'border-rose-500')} />
          {fieldError('startDate') && <p className="text-xs text-rose-500">{fieldError('startDate')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">End Date *</Label>
          <Input id="endDate" type="date" {...register('endDate')} className={cn(fieldError('endDate') && 'border-rose-500')} />
          {fieldError('endDate') && <p className="text-xs text-rose-500">{fieldError('endDate')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <Select value={watch('status') || 'upcoming'} onValueChange={(v) => setValue('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={watch('isCurrent') || false}
            onCheckedChange={(v) => setValue('isCurrent', v)}
          />
          <Label>Set as current session</Label>
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 self-start">
        {isLoading ? 'Saving...' : defaultValues?.id ? 'Update Session' : 'Create Session'}
      </Button>
    </form>
  );
}
