'use client';

// ============================================================
// Promotions Page — Student promotion wizard
// 4-step: Select Session → Source Class → Select Students → Destination
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/atoms/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import FormWizard from '@/components/organisms/form-wizard';
import { slideUp, transitions } from '@/lib/animations';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';

// ── Types ────────────────────────────────────────────────

interface LookupItem {
  id: number;
  name: string;
}

interface StudentLookup {
  id: number;
  name: string;
  roll?: string;
  className?: string;
  section?: string;
}

// ── Page ─────────────────────────────────────────────────

export default function PromotionsPage() {
  const queryClient = useQueryClient();

  // Wizard state
  const [targetSession, setTargetSession] = React.useState('');
  const [sourceClass, setSourceClass] = React.useState('');
  const [selectedStudents, setSelectedStudents] = React.useState<Set<number>>(new Set());
  const [destClass, setDestClass] = React.useState('');
  const [destSection, setDestSection] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isPromoting, setIsPromoting] = React.useState(false);

  // ── Fetch academic sessions ─────────────────────────────
  const {
    data: sessionsResponse,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['sessions-list'],
    queryFn: async () => {
      const res = await fetch('/api/academic-sessions?limit=50');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const sessions: LookupItem[] = (sessionsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as number,
    name: (s.name as string) || '',
  }));

  // ── Fetch classes ───────────────────────────────────────
  const {
    data: classesResponse,
    isLoading: classesLoading,
  } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100');
      if (!res.ok) throw new Error('Failed to fetch classes');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const classes: LookupItem[] = (classesResponse?.data || []).map((c: Record<string, unknown>) => ({
    id: c.id as number,
    name: (c.name as string) || '',
  }));

  // ── Fetch sections ──────────────────────────────────────
  const {
    data: sectionsResponse,
  } = useQuery({
    queryKey: ['sections-list'],
    queryFn: async () => {
      const res = await fetch('/api/sections?limit=100');
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
  const sections: LookupItem[] = (sectionsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as number,
    name: (s.name as string) || '',
  }));

  // ── Fetch students from source class (when sourceClass changes) ──
  const {
    data: studentsResponse,
    isLoading: studentsLoading,
  } = useQuery({
    queryKey: ['students-by-class', sourceClass],
    queryFn: async () => {
      if (!sourceClass) return { data: [] };
      const res = await fetch(`/api/students?classId=${sourceClass}&limit=200`);
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
    enabled: !!sourceClass,
  });
  const students: StudentLookup[] = (studentsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as number,
    name: (s.name as string) || '',
    roll: (s.rollNo as string) || (s.roll as string) || '',
    className: (s.class as Record<string, string>)?.name || (s.className as string) || '',
    section: (s.section as Record<string, string>)?.name || (s.section as string) || '',
  }));

  // ── Promotion mutation ──────────────────────────────────
  const promoteMutation = useMutation({
    mutationFn: async ({ studentIds, destClassId, destSectionId, sessionId }: {
      studentIds: number[];
      destClassId: string;
      destSectionId: string;
      sessionId: string;
    }) => {
      // Update each student's class/section via PUT
      const results = await Promise.allSettled(
        studentIds.map(async (id) => {
          const body: Record<string, unknown> = {
            classId: Number(destClassId),
            academicSessionId: Number(sessionId),
          };
          if (destSectionId) {
            body.sectionId = Number(destSectionId);
          }
          const res = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json.error || `Failed to promote student ${id}`);
          }
          return res.json();
        })
      );
      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`${failed.length} student(s) failed to promote`);
      }
      return results.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} student(s) promoted successfully!`);
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students-by-class'] });
      // Reset wizard
      setTargetSession('');
      setSourceClass('');
      setSelectedStudents(new Set());
      setDestClass('');
      setDestSection('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Promotion failed');
    },
  });

  const toggleStudent = (id: number) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudents(next);
  };

  const toggleAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map((s) => s.id)));
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.roll || '').includes(searchQuery)
  );

  const handlePromote = async () => {
    promoteMutation.mutate({
      studentIds: Array.from(selectedStudents),
      destClassId: destClass,
      destSectionId: destSection,
      sessionId: targetSession,
    });
  };

  // Error state for sessions (critical dependency)
  if (sessionsError) {
    return (
      <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="flex flex-col gap-6">
        <PageHeader title="Student Promotions" description="Promote students to the next class for a new academic session" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load data</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching academic sessions. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetchSessions()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  // Step 1: Select target session
  const step1 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select the academic session to promote students into.</p>
      <div className="flex flex-col gap-1.5">
        <Label>Target Academic Session *</Label>
        <Select value={targetSession} onValueChange={setTargetSession}>
          <SelectTrigger>
            <SelectValue placeholder="Select academic session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {sessions.length === 0 && !sessionsLoading && (
        <p className="text-xs text-amber-600">No academic sessions found. Create one first in the Sessions page.</p>
      )}
    </div>
  );

  // Step 2: Select source class
  const step2 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select the class to promote students from.</p>
      <div className="flex flex-col gap-1.5">
        <Label>Source Class *</Label>
        <Select value={sourceClass} onValueChange={(v) => { setSourceClass(v); setSelectedStudents(new Set()); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {classes.length === 0 && !classesLoading && (
        <p className="text-xs text-amber-600">No classes found. Create one first in the Classes page.</p>
      )}
    </div>
  );

  // Step 3: Select students
  const step3 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select students to promote. Use the search to find specific students.</p>

      {studentsLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading students...
        </div>
      )}

      {!studentsLoading && students.length === 0 && sourceClass && (
        <p className="text-sm text-amber-600 py-2">No students found in this class.</p>
      )}

      {students.length > 0 && (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={toggleAll}>
              {selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            {filteredStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedStudents.has(student.id)}
                  onCheckedChange={() => toggleStudent(student.id)}
                />
                <span className="text-sm font-medium flex-1">{student.name}</span>
                {student.roll && <Badge variant="outline" className="text-xs font-mono">Roll {student.roll}</Badge>}
                {student.section && <Badge variant="secondary" className="text-xs">Sec {student.section}</Badge>}
              </label>
            ))}
          </div>
        </>
      )}

      <p className="text-sm text-muted-foreground">
        {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
      </p>
    </div>
  );

  // Step 4: Destination + confirm
  const step4 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select the destination class and section for the promoted students.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Destination Class *</Label>
          <Select value={destClass} onValueChange={setDestClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Destination Section</Label>
          <Select value={destSection || '_none'} onValueChange={(v) => setDestSection(v === '_none' ? '' : v)}>
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
      </div>

      {/* Review summary */}
      <Card className="bg-muted/30 border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Promotion Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Session:</span>
              <span className="font-medium">{sessions.find((s) => String(s.id) === targetSession)?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source Class:</span>
              <span className="font-medium">{classes.find((c) => String(c.id) === sourceClass)?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination:</span>
              <span className="font-medium">
                {classes.find((c) => String(c.id) === destClass)?.name || '—'}
                {destSection && ` / ${sections.find((s) => String(s.id) === destSection)?.name || ''}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Students:</span>
              <span className="font-medium text-emerald-600">{selectedStudents.size} selected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = [
    { title: 'Session', component: step1, validate: () => !!targetSession },
    { title: 'Source Class', component: step2, validate: () => !!sourceClass },
    { title: 'Students', component: step3, validate: () => selectedStudents.size > 0 },
    { title: 'Destination', component: step4, validate: () => !!destClass },
  ];

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Student Promotions"
        description="Promote students to the next class for a new academic session"
      />

      <Card>
        <CardContent className="p-6">
          <FormWizard
            steps={steps}
            onSubmit={handlePromote}
            isLoading={promoteMutation.isPending}
            submitLabel="Confirm Promotion"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
