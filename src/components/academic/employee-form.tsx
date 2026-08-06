'use client';

// ============================================================
// EmployeeForm — Multi-step form for employees
// Steps: Personal, Employment
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

const employmentSchema = z.object({
  employeeIdNo: z.string().min(1, 'Employee ID is required'),
  department: z.string().optional(),
  designation: z.string().optional(),
  joiningDate: z.string().optional(),
  salaryGrade: z.string().optional(),
});

const employeeSchema = personalSchema.merge(employmentSchema);
type EmployeeFormData = z.infer<typeof employeeSchema>;

export interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormData> & { id?: number };
  onSuccess?: () => void;
  className?: string;
}

const departments = ['Administration', 'Finance', 'Academic', 'Library', 'IT', 'Maintenance', 'Security', 'Kitchen'];
const designations = ['Manager', 'Assistant', 'Clerk', 'Accountant', 'Librarian', 'IT Staff', 'Guard', 'Cook', 'Peon'];

export default function EmployeeForm({
  defaultValues,
  onSuccess,
  className,
}: EmployeeFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      photoUrl: '',
      employeeIdNo: '',
      department: '',
      designation: '',
      joiningDate: '',
      salaryGrade: '',
      ...defaultValues,
    },
  });

  const photoUrl = watch('photoUrl');
  const name = watch('name');

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      const url = defaultValues?.id ? `/api/employees/${defaultValues.id}` : '/api/employees';
      const method = defaultValues?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success(defaultValues?.id ? 'Employee updated' : 'Employee added successfully');
      onSuccess?.();
    } catch (err) { toast.error(String(err)); } finally { setIsLoading(false); }
  };

  const fieldError = (n: keyof EmployeeFormData) => errors[n]?.message;
  const inputClass = (n: keyof EmployeeFormData) => cn(fieldError(n) && 'border-rose-500 focus-visible:ring-rose-500');

  const personalStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <div className="flex items-start gap-4">
          <PhotoUpload value={photoUrl} onChange={(v) => setValue('photoUrl', v)} name={name} size={80} />
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register('name')} className={inputClass('name')} placeholder="Employee name" />
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
          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
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

  const employmentStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employeeIdNo">Employee ID *</Label>
        <Input id="employeeIdNo" {...register('employeeIdNo')} className={inputClass('employeeIdNo')} placeholder="e.g. EMP-001" />
        {fieldError('employeeIdNo') && <p className="text-xs text-rose-500">{fieldError('employeeIdNo')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Department</Label>
        <Select value={watch('department') || '_none'} onValueChange={(v) => setValue('department', v === '_none' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Designation</Label>
        <Select value={watch('designation') || '_none'} onValueChange={(v) => setValue('designation', v === '_none' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {designations.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="joiningDate">Joining Date</Label>
        <Input id="joiningDate" type="date" {...register('joiningDate')} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Salary Grade</Label>
        <Select value={watch('salaryGrade') || '_none'} onValueChange={(v) => setValue('salaryGrade', v === '_none' ? '' : v)}>
          <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const steps = [
    { title: 'Personal', component: personalStep, validate: () => trigger(['name', 'phone']) },
    { title: 'Employment', component: employmentStep, validate: () => trigger(['employeeIdNo']) },
  ];

  return (
    <div className={className}>
      <FormWizard steps={steps} onSubmit={handleSubmit(onSubmit)} isLoading={isLoading} submitLabel={defaultValues?.id ? 'Update Employee' : 'Add Employee'} />
    </div>
  );
}
