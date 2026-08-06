'use client';

// ============================================================
// TeacherForm — Multi-step form for teachers
// Steps: Personal, Professional
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormWizard from '@/components/organisms/form-wizard';
import PhotoUpload from '@/components/molecules/photo-upload';

// ── Schemas ──────────────────────────────────────────────

const personalSchema = z.object({
  name: z.string().min(2, 'Name is required (min 2 chars)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  photoUrl: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const professionalSchema = z.object({
  employeeIdNo: z.string().min(1, 'Employee ID is required'),
  qualification: z.string().optional(),
  specialization: z.string().optional(),
  joiningDate: z.string().optional(),
});

const teacherSchema = personalSchema.merge(professionalSchema);
type TeacherFormData = z.infer<typeof teacherSchema>;

// ── Component ────────────────────────────────────────────

export interface TeacherFormProps {
  defaultValues?: Partial<TeacherFormData> & { id?: number };
  onSuccess?: () => void;
  className?: string;
}

export default function TeacherForm({
  defaultValues,
  onSuccess,
  className,
}: TeacherFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      photoUrl: '',
      employeeIdNo: '',
      qualification: '',
      specialization: '',
      joiningDate: '',
      ...defaultValues,
    },
  });

  const photoUrl = watch('photoUrl');
  const name = watch('name');

  const onSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      const url = defaultValues?.id ? `/api/teachers/${defaultValues.id}` : '/api/teachers';
      const method = defaultValues?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save teacher');
      }

      toast.success(defaultValues?.id ? 'Teacher updated' : 'Teacher added successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (name: keyof TeacherFormData) => errors[name]?.message;
  const inputClass = (name: keyof TeacherFormData) =>
    cn(fieldError(name) && 'border-rose-500 focus-visible:ring-rose-500');

  // Step 1: Personal
  const personalStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <div className="flex items-start gap-4">
          <PhotoUpload value={photoUrl} onChange={(v) => setValue('photoUrl', v)} name={name} size={80} />
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register('name')} className={inputClass('name')} placeholder="Teacher name" />
              {fieldError('name') && <p className="text-xs text-rose-500">{fieldError('name')}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" {...register('phone')} className={inputClass('phone')} placeholder="+880 ..." />
        {fieldError('phone') && <p className="text-xs text-rose-500">{fieldError('phone')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Gender</Label>
        <Select value={watch('gender') || '_none'} onValueChange={(v) => setValue('gender', v === '_none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} placeholder="Address" />
      </div>
    </div>
  );

  // Step 2: Professional
  const professionalStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employeeIdNo">Employee ID *</Label>
        <Input id="employeeIdNo" {...register('employeeIdNo')} className={inputClass('employeeIdNo')} placeholder="e.g. TCH-001" />
        {fieldError('employeeIdNo') && <p className="text-xs text-rose-500">{fieldError('employeeIdNo')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="qualification">Qualification</Label>
        <Input id="qualification" {...register('qualification')} placeholder="e.g. M.A. Islamic Studies" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="specialization">Subject Specialization</Label>
        <Input id="specialization" {...register('specialization')} placeholder="e.g. Quran & Hadith" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="joiningDate">Joining Date</Label>
        <Input id="joiningDate" type="date" {...register('joiningDate')} />
      </div>
    </div>
  );

  const steps = [
    { title: 'Personal', component: personalStep, validate: () => trigger(['name', 'phone']) },
    { title: 'Professional', component: professionalStep, validate: () => trigger(['employeeIdNo']) },
  ];

  return (
    <div className={className}>
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
        submitLabel={defaultValues?.id ? 'Update Teacher' : 'Add Teacher'}
      />
    </div>
  );
}
