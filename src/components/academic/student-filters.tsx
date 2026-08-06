'use client';

// ============================================================
// StudentFilters — Filter bar for students list
// Class, Section, Status, Gender dropdowns + reset
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

export interface StudentFilterValues {
  classId?: string;
  sectionId?: string;
  status?: string;
  gender?: string;
  academicSessionId?: string;
}

export interface StudentFiltersProps {
  values: StudentFilterValues;
  onChange: (values: StudentFilterValues) => void;
  classes?: Array<{ id: number; name: string }>;
  sections?: Array<{ id: number; name: string }>;
  sessions?: Array<{ id: number; name: string }>;
  className?: string;
}

export default function StudentFilters({
  values,
  onChange,
  classes = [],
  sections = [],
  sessions = [],
  className,
}: StudentFiltersProps) {
  const hasFilters = values.classId || values.sectionId || values.status || values.gender || values.academicSessionId;

  const reset = () => {
    onChange({});
  };

  const update = (key: keyof StudentFilterValues, value: string) => {
    onChange({ ...values, [key]: value === '_all' ? undefined : value });
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Class */}
      <Select value={values.classId || '_all'} onValueChange={(v) => update('classId', v)}>
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder="Class" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Classes</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Section */}
      <Select value={values.sectionId || '_all'} onValueChange={(v) => update('sectionId', v)}>
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue placeholder="Section" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Sections</SelectItem>
          {sections.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={values.status || '_all'} onValueChange={(v) => update('status', v)}>
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="graduated">Graduated</SelectItem>
          <SelectItem value="transferred">Transferred</SelectItem>
        </SelectContent>
      </Select>

      {/* Gender */}
      <Select value={values.gender || '_all'} onValueChange={(v) => update('gender', v)}>
        <SelectTrigger className="w-[120px] h-9 text-sm">
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Gender</SelectItem>
          <SelectItem value="Male">Male</SelectItem>
          <SelectItem value="Female">Female</SelectItem>
        </SelectContent>
      </Select>

      {/* Academic Session */}
      {sessions.length > 0 && (
        <Select value={values.academicSessionId || '_all'} onValueChange={(v) => update('academicSessionId', v)}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Session" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Sessions</SelectItem>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={reset} className="h-9 gap-1 text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
