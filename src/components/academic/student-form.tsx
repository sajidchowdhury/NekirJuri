'use client';

// ============================================================
// StudentForm — Multi-step admission/edit form for students
// Steps: Personal, Academic, Guardian
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormWizard from '@/components/organisms/form-wizard';
import PhotoUpload from '@/components/molecules/photo-upload';
import { UserPlus } from 'lucide-react';

// ── Zod schemas ──────────────────────────────────────────

const personalSchema = z.object({
  name: z.string().min(2, 'Name is required (min 2 chars)'),
  nameBn: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  bloodGroup: z.string().optional(),
  photoUrl: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

const academicSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().optional(),
  rollNo: z.string().optional(),
  academicSessionId: z.string().min(1, 'Academic session is required'),
  admissionDate: z.string().optional(),
});

const guardianSchema = z.object({
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string().min(1, 'Guardian phone is required'),
  guardianRelation: z.string().optional(),
});

const studentSchema = personalSchema.merge(academicSchema).merge(guardianSchema);
type StudentFormData = z.infer<typeof studentSchema>;

// ── Component ────────────────────────────────────────────

export interface StudentFormProps {
  /** Existing student data for edit mode */
  defaultValues?: Partial<StudentFormData> & { id?: number };
  /** Classes for select */
  classes?: Array<{ id: number; name: string }>;
  /** Sections for select */
  sections?: Array<{ id: number; name: string }>;
  /** Academic sessions for select */
  sessions?: Array<{ id: number; name: string }>;
  /** Callback on success */
  onSuccess?: () => void;
  className?: string;
}

export default function StudentForm({
  defaultValues,
  classes = [],
  sections = [],
  sessions = [],
  onSuccess,
  className,
}: StudentFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      nameBn: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      photoUrl: '',
      classId: '',
      sectionId: '',
      rollNo: '',
      academicSessionId: '',
      admissionDate: '',
      fatherName: '',
      motherName: '',
      guardianName: '',
      guardianPhone: '',
      guardianRelation: '',
      ...defaultValues,
    },
  });

  const photoUrl = watch('photoUrl');
  const name = watch('name');

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      const body = {
        ...data,
        registrationNo: `STU-${Date.now()}`,
        classId: Number(data.classId),
        sectionId: data.sectionId ? Number(data.sectionId) : undefined,
        academicSessionId: Number(data.academicSessionId),
      };

      const url = defaultValues?.id
        ? `/api/students/${defaultValues.id}`
        : '/api/students';
      const method = defaultValues?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save student');
      }

      toast.success(defaultValues?.id ? 'Student updated' : 'Student admitted successfully');
      onSuccess?.();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Field error helper
  const fieldError = (name: keyof StudentFormData) =>
    errors[name]?.message;

  const inputClass = (name: keyof StudentFormData) =>
    cn(fieldError(name) && 'border-rose-500 focus-visible:ring-rose-500');

  // Step 1: Personal
  const personalStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <div className="flex items-start gap-4">
          <PhotoUpload
            value={photoUrl}
            onChange={(v) => setValue('photoUrl', v)}
            name={name}
            size={80}
          />
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full Name (English) *</Label>
              <Input id="name" {...register('name')} className={inputClass('name')} placeholder="Student name in English" />
              {fieldError('name') && <p className="text-xs text-rose-500">{fieldError('name')}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nameBn">Name (Bengali)</Label>
        <Input id="nameBn" {...register('nameBn')} placeholder="বাংলায় নাম" className="font-bengali" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} className={inputClass('dateOfBirth')} />
        {fieldError('dateOfBirth') && <p className="text-xs text-rose-500">{fieldError('dateOfBirth')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Gender *</Label>
        <Select value={watch('gender')} onValueChange={(v) => setValue('gender', v)}>
          <SelectTrigger className={cn(inputClass('gender'))}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
        {fieldError('gender') && <p className="text-xs text-rose-500">{fieldError('gender')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Blood Group</Label>
        <Select value={watch('bloodGroup') || '_none'} onValueChange={(v) => setValue('bloodGroup', v === '_none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <SelectItem key={bg} value={bg}>{bg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register('address')} placeholder="Address" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="city">City</Label>
        <Input id="city" {...register('city')} placeholder="City" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="country">Country</Label>
        <Input id="country" {...register('country')} placeholder="Country" />
      </div>
    </div>
  );

  // Step 2: Academic
  const academicStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Class *</Label>
        <Select value={watch('classId')} onValueChange={(v) => setValue('classId', v)}>
          <SelectTrigger className={cn(inputClass('classId'))}>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError('classId') && <p className="text-xs text-rose-500">{fieldError('classId')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Section</Label>
        <Select value={watch('sectionId') || '_none'} onValueChange={(v) => setValue('sectionId', v === '_none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rollNo">Roll Number</Label>
        <Input id="rollNo" {...register('rollNo')} placeholder="e.g. 01" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Academic Session *</Label>
        <Select value={watch('academicSessionId')} onValueChange={(v) => setValue('academicSessionId', v)}>
          <SelectTrigger className={cn(inputClass('academicSessionId'))}>
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldError('academicSessionId') && <p className="text-xs text-rose-500">{fieldError('academicSessionId')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="admissionDate">Admission Date</Label>
        <Input id="admissionDate" type="date" {...register('admissionDate')} />
      </div>
    </div>
  );

  // Step 3: Guardian
  const guardianStep = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fatherName">Father&apos;s Name</Label>
        <Input id="fatherName" {...register('fatherName')} placeholder="Father's name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="motherName">Mother&apos;s Name</Label>
        <Input id="motherName" {...register('motherName')} placeholder="Mother's name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guardianName">Guardian Name *</Label>
        <Input id="guardianName" {...register('guardianName')} className={inputClass('guardianName')} placeholder="Guardian name" />
        {fieldError('guardianName') && <p className="text-xs text-rose-500">{fieldError('guardianName')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="guardianPhone">Guardian Phone *</Label>
        <Input id="guardianPhone" {...register('guardianPhone')} className={inputClass('guardianPhone')} placeholder="+880 ..." />
        {fieldError('guardianPhone') && <p className="text-xs text-rose-500">{fieldError('guardianPhone')}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Guardian Relation</Label>
        <Select value={watch('guardianRelation') || '_none'} onValueChange={(v) => setValue('guardianRelation', v === '_none' ? '' : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select relation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">None</SelectItem>
            <SelectItem value="Father">Father</SelectItem>
            <SelectItem value="Mother">Mother</SelectItem>
            <SelectItem value="Guardian">Guardian</SelectItem>
            <SelectItem value="Uncle">Uncle</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const steps = [
    { title: 'Personal', component: personalStep, validate: () => trigger(['name', 'dateOfBirth', 'gender']) },
    { title: 'Academic', component: academicStep, validate: () => trigger(['classId', 'academicSessionId']) },
    { title: 'Guardian', component: guardianStep, validate: () => trigger(['guardianName', 'guardianPhone']) },
  ];

  return (
    <div className={cn('', className)}>
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
        submitLabel={defaultValues?.id ? 'Update Student' : 'Admit Student'}
      />
    </div>
  );
}
