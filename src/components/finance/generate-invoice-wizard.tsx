'use client';

// ============================================================
// GenerateInvoiceWizard — 4-step wizard to generate invoices
// 1) Select Session + Class, 2) Select Students, 3) Review, 4) Confirm
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Search, Users, FileText, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormWizard from '@/components/organisms/form-wizard';
import {
  type AcademicSession,
  type ClassGroup,
  type FeeCategory,
  type FeeStructureCell,
  formatTaka,
} from '@/lib/finance/sample-data';

interface GenerateInvoiceWizardProps {
  onComplete?: () => void;
}

export default function GenerateInvoiceWizard({ onComplete }: GenerateInvoiceWizardProps) {
  // Fetch sessions from API
  const { data: sessionsResponse } = useQuery({
    queryKey: ['academic-sessions'],
    queryFn: async () => {
      const res = await fetch('/api/academic-sessions?limit=50');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch classes from API
  const { data: classesResponse } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100');
      if (!res.ok) throw new Error('Failed to fetch classes');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch students from API
  const { data: studentsResponse } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/students?limit=500');
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch fee categories from API
  const { data: feeCategoriesResponse } = useQuery({
    queryKey: ['fee-categories'],
    queryFn: async () => {
      const res = await fetch('/api/fee-categories?limit=50');
      if (!res.ok) throw new Error('Failed to fetch fee categories');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch fee structures from API
  const { data: feeStructuresResponse } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const res = await fetch('/api/fee-structures?limit=100');
      if (!res.ok) throw new Error('Failed to fetch fee structures');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const sessions: AcademicSession[] = sessionsResponse?.data || [];
  const classes: ClassGroup[] = classesResponse?.data || [];
  const studentsForInvoice = (studentsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: String(s.id),
    name: String(s.name || s.nameEn || ''),
    nameBn: String(s.nameBn || ''),
    className: String(s.className || ''),
    roll: String(s.roll || s.rollNo || ''),
  }));
  const feeCategories: FeeCategory[] = feeCategoriesResponse?.data || [];
  const feeStructure: FeeStructureCell[] = feeStructuresResponse?.data || [];

  // Step 1 state
  const [selectedSession, setSelectedSession] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState('');

  // Step 2 state
  const [studentSearch, setStudentSearch] = React.useState('');
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<Set<string>>(new Set());

  // Derived
  const currentSession = sessions.find(s => s.id === selectedSession);
  const currentClass = classes.find(c => c.id === selectedClass);

  const filteredStudents = studentsForInvoice.filter((s: { id: string; name: string; nameBn: string; className: string; roll: string }) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.nameBn.includes(studentSearch) ||
    s.roll.includes(studentSearch)
  );

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Fee structure for selected class
  const classFeeItems = feeStructure.filter(s => s.classId === selectedClass && s.isSet && s.amount > 0);
  const totalPerStudent = classFeeItems.reduce((sum, item) => sum + item.amount, 0);

  // Step 1 component
  const step1Content = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select the academic session and class to generate invoices for.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Academic Session</Label>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger>
              <SelectValue placeholder="Select session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nameBn} ({c.name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {currentSession && currentClass && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 dark:text-emerald-400">
                {currentSession.name} — {currentClass.nameBn} ({currentClass.name})
              </span>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  // Step 2 component
  const step2Content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select students to generate invoices for.
        </p>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <Users className="h-3 w-3 mr-1" />
          {selectedStudentIds.size} selected
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, Bengali name, or roll..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No students found</p>
        ) : (
          filteredStudents.map(student => (
            <div
              key={student.id}
              className="flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={selectedStudentIds.has(student.id)}
                onCheckedChange={() => toggleStudent(student.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{student.name}</p>
                <p className="text-xs text-muted-foreground truncate">{student.nameBn} • Roll: {student.roll}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0">{student.className}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Step 3 component
  const step3Content = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Review the fee structure and amounts that will be applied.</p>

      {classFeeItems.length === 0 ? (
        <p className="text-sm text-amber-600 py-4 text-center">No fee items configured for this class.</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fee Category</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {classFeeItems.map(item => {
                const cat = feeCategories.find(c => c.id === item.categoryId);
                return (
                  <tr key={item.categoryId} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2">{cat?.nameEn || item.categoryId}</td>
                    <td className="px-3 py-2 text-right font-semibold text-amber-600 dark:text-amber-400">
                      {formatTaka(item.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 border-t-2 border-emerald-200 dark:border-emerald-800">
                <td className="px-3 py-2 font-semibold">Total per Student</td>
                <td className="px-3 py-2 text-right font-bold text-emerald-700 dark:text-emerald-400">
                  {formatTaka(totalPerStudent)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-3 space-y-1">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {selectedStudentIds.size} students × {formatTaka(totalPerStudent)} = {formatTaka(totalPerStudent * selectedStudentIds.size)}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Step 4 component
  const step4Content = (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Confirm invoice generation.</p>

      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Invoice Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Session</p>
              <p className="font-medium">{currentSession?.name || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Class</p>
              <p className="font-medium">{currentClass?.name || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Students</p>
              <p className="font-medium">{selectedStudentIds.size}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Per Student</p>
              <p className="font-medium text-amber-600 dark:text-amber-400">{formatTaka(totalPerStudent)}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-muted-foreground text-xs">Total Amount</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatTaka(totalPerStudent * selectedStudentIds.size)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = [
    {
      title: 'Session & Class',
      component: step1Content,
      validate: () => !!selectedSession && !!selectedClass,
    },
    {
      title: 'Select Students',
      component: step2Content,
      validate: () => selectedStudentIds.size > 0,
    },
    {
      title: 'Review Fees',
      component: step3Content,
      validate: () => classFeeItems.length > 0,
    },
    {
      title: 'Confirm',
      component: step4Content,
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={async () => {
        // Simulate invoice generation
        await new Promise(resolve => setTimeout(resolve, 1500));
        onComplete?.();
      }}
      submitLabel="Generate Invoices"
      isLoading={false}
    />
  );
}
