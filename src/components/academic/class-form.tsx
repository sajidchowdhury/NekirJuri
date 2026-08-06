'use client';

// ============================================================
// ClassForm — Create/edit class form
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

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  code: z.string().min(1, 'Code is required'),
  orderSequence: z.string().optional(),
  capacity: z.string().optional(),
  teacherId: z.string().optional(),
  academicSessionId: z.string().optional(),
  description: z.string().optional(),
});

type ClassFormData = z.infer<typeof classSchema>;

export interface ClassFormProps {
  defaultValues?: Partial<ClassFormData> & { id?: number };
  teachers?: Array<{ id: number; name: string }>;
  sessions?: Array<{ id: number; name: string }>;
  onSuccess?: () => void;
  className?: string;
}

export default function ClassForm({
  defaultValues,
  teachers = [],
  sessions = [],
  onSuccess,
  className,
}: ClassFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      code: '',
      orderSequence: '',
      capacity: '',
      teacherId: '',
      academicSessionId: '',
      description: '',
      ...defaultValues,
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    setIsLoading(true);
    try {
      const body = {
        ...data,
        orderSequence: data.orderSequence ? Number(data.orderSequence) : 1,
        capacity: data.capacity ? Number(data.capacity) : null,
        teacherId: data.teacherId ? Number(data.teacherId) : null,
        academicSessionId: data.academicSessionId ? Number(data.academicSessionId) : null,
      };

      const url = defaultValues?.id ? `/api/classes/${defaultValues.id}` : '/api/classes';
      const method = defaultValues?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success(defaultValues?.id ? 'Class updated' : 'Class created successfully');
      onSuccess?.();
    } catch (err) { toast.error(String(err)); } finally { setIsLoading(false); }
  };

  const fieldError = (n: keyof ClassFormData) => errors[n]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Class Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Class 5" className={cn(fieldError('name') && 'border-rose-500')} />
          {fieldError('name') && <p className="text-xs text-rose-500">{fieldError('name')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Code *</Label>
          <Input id="code" {...register('code')} placeholder="e.g. C5" className={cn(fieldError('code') && 'border-rose-500')} />
          {fieldError('code') && <p className="text-xs text-rose-500">{fieldError('code')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orderSequence">Order Sequence</Label>
          <Input id="orderSequence" type="number" {...register('orderSequence')} placeholder="1" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" {...register('capacity')} placeholder="e.g. 40" />
        </div>
        {teachers.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Class Teacher</Label>
            <Select value={watch('teacherId') || '_none'} onValueChange={(v) => setValue('teacherId', v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {teachers.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        {sessions.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Academic Session</Label>
            <Select value={watch('academicSessionId') || '_none'} onValueChange={(v) => setValue('academicSessionId', v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {sessions.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" {...register('description')} placeholder="Optional description" />
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 self-start">
        {isLoading ? 'Saving...' : defaultValues?.id ? 'Update Class' : 'Create Class'}
      </Button>
    </form>
  );
}
