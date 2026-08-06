'use client';

// ============================================================
// SectionForm — Create section form
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

const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  classId: z.string().min(1, 'Class is required'),
  capacity: z.string().optional(),
  teacherId: z.string().optional(),
});

type SectionFormData = z.infer<typeof sectionSchema>;

export interface SectionFormProps {
  classes?: Array<{ id: number; name: string }>;
  teachers?: Array<{ id: number; name: string }>;
  onSuccess?: () => void;
  className?: string;
}

export default function SectionForm({
  classes = [],
  teachers = [],
  onSuccess,
  className,
}: SectionFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { name: '', classId: '', capacity: '', teacherId: '' },
  });

  const onSubmit = async (data: SectionFormData) => {
    setIsLoading(true);
    try {
      const body = {
        ...data,
        classId: Number(data.classId),
        capacity: data.capacity ? Number(data.capacity) : null,
        teacherId: data.teacherId ? Number(data.teacherId) : null,
      };
      const res = await fetch('/api/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success('Section created successfully');
      onSuccess?.();
    } catch (err) { toast.error(String(err)); } finally { setIsLoading(false); }
  };

  const fieldError = (n: keyof SectionFormData) => errors[n]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-4', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Class *</Label>
          <Select value={watch('classId')} onValueChange={(v) => setValue('classId', v)}>
            <SelectTrigger className={cn(fieldError('classId') && 'border-rose-500')}><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {fieldError('classId') && <p className="text-xs text-rose-500">{fieldError('classId')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Section Name *</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Section A" className={cn(fieldError('name') && 'border-rose-500')} />
          {fieldError('name') && <p className="text-xs text-rose-500">{fieldError('name')}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="capacity">Capacity</Label>
          <Input id="capacity" type="number" {...register('capacity')} placeholder="e.g. 40" />
        </div>
        {teachers.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label>Section In-charge</Label>
            <Select value={watch('teacherId') || '_none'} onValueChange={(v) => setValue('teacherId', v === '_none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">None</SelectItem>
                {teachers.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 self-start">
        {isLoading ? 'Saving...' : 'Create Section'}
      </Button>
    </form>
  );
}
