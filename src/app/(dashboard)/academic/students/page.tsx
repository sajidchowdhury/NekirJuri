'use client';

// ============================================================
// Students Page — List, search, filter, and manage students
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/atoms/page-header';
import { DataTable } from '@/components/organisms/data-table';
import StudentFilters, { StudentFilterValues } from '@/components/academic/student-filters';
import StudentProfileCard from '@/components/academic/student-profile-card';
import ExportButton from '@/components/molecules/export-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatusBadge from '@/components/atoms/status-badge';
import StudentForm from '@/components/academic/student-form';
import { staggerChildren, slideUp, transitions } from '@/lib/animations';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';
import { apiDelete } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────

interface Student {
  id: number;
  name: string;
  nameBn?: string;
  className?: string;
  section?: string;
  roll?: string;
  gender: string;
  status: string;
  phone?: string;
  photoUrl?: string;
  classId?: number;
  sectionId?: number;
}

interface LookupItem {
  id: number;
  name: string;
}

// ── Page ─────────────────────────────────────────────────

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = React.useState<StudentFilterValues>({});
  const [formOpen, setFormOpen] = React.useState(false);
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);

  // ── Fetch students ──────────────────────────────────────
  const {
    data: studentsResponse,
    isLoading: studentsLoading,
    isError: studentsError,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.classId) params.set('classId', filters.classId);
      if (filters.sectionId) params.set('sectionId', filters.sectionId);
      if (filters.status) params.set('status', filters.status);
      if (filters.gender) params.set('search', filters.gender);
      const res = await fetch(`/api/students?${params}`);
      if (!res.ok) throw new Error('Failed to fetch students');
      return res.json();
    },
  });

  const students: Student[] = studentsResponse?.data || [];

  // ── Fetch classes for filters ──────────────────────────
  const { data: classesResponse } = useQuery({
    queryKey: ['classes-list'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100');
      if (!res.ok) throw new Error('Failed to fetch classes');
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 min — classes change rarely
  });
  const classes: LookupItem[] = (classesResponse?.data || []).map((c: Record<string, unknown>) => ({
    id: c.id as number,
    name: (c.name as string) || '',
  }));

  // ── Fetch sections for filters ─────────────────────────
  const { data: sectionsResponse } = useQuery({
    queryKey: ['sections-list'],
    queryFn: async () => {
      const res = await fetch('/api/sections?limit=100');
      if (!res.ok) throw new Error('Failed to fetch sections');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
  const sections: LookupItem[] = (sectionsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as number,
    name: (s.name as string) || '',
  }));

  // ── Fetch academic sessions for filters ────────────────
  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions-list'],
    queryFn: async () => {
      const res = await fetch('/api/academic-sessions?limit=50');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
  const sessions: LookupItem[] = (sessionsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as number,
    name: (s.name as string) || '',
  }));

  // ── Delete mutation ─────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/students/${id}`),
    onSuccess: () => {
      toast.success('Student deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete student');
    },
  });

  const handleDelete = (student: Student) => {
    if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(student.id);
    }
  };

  // ── Columns ─────────────────────────────────────────────
  const columns: ColumnDef<Student, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }) => {
        const s = row.original;
        const initials = s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={s.photoUrl} alt={s.name} />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-sm font-medium truncate">{s.name}</span>
              {s.nameBn && <span className="text-xs text-muted-foreground font-bengali truncate">{s.nameBn}</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'className',
      header: 'Class',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">{row.original.className || '—'}</Badge>
      ),
    },
    {
      accessorKey: 'section',
      header: 'Section',
      cell: ({ row }) => <span className="text-sm">{row.original.section || '—'}</span>,
    },
    {
      accessorKey: 'roll',
      header: 'Roll',
      cell: ({ row }) => <span className="text-sm font-mono">{row.original.roll || '—'}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Guardian Phone',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.phone || '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusBadge status={row.original.status as 'active' | 'inactive'} />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Eye className="h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setEditStudent(row.original)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600" onClick={() => handleDelete(row.original)}>
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Mobile card renderer
  const renderCard = (student: Student) => (
    <StudentProfileCard
      name={student.name}
      nameBn={student.nameBn}
      photoUrl={student.photoUrl}
      section={student.section}
      roll={student.roll}
      status={student.status}
    />
  );

  // Handle form success — invalidate queries and close dialog
  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditStudent(null);
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };

  // Error state
  if (studentsError) {
    return (
      <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="flex flex-col gap-6">
        <PageHeader title="Students" description="Manage student admissions, enrollment, and academic records" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load students</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching student data. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetchStudents()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <PageHeader
        title="Students"
        description="Manage student admissions, enrollment, and academic records"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton
              onExportCSV={() => toast.info('CSV export coming soon')}
              onExportPDF={() => toast.info('PDF export coming soon')}
            />
            <Button
              onClick={() => { setEditStudent(null); setFormOpen(true); }}
              className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Admit Student
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <StudentFilters
        values={filters}
        onChange={setFilters}
        classes={classes}
        sections={sections}
        sessions={sessions}
      />

      {/* Data table */}
      <DataTable
        columns={columns}
        data={students}
        searchable
        searchPlaceholder="Search students..."
        sortable
        paginated
        pageSize={10}
        isLoading={studentsLoading}
        emptyMessage="No students found"
        emptyDescription="Admit your first student to get started."
        renderCard={renderCard}
      />

      {/* Admission/Edit dialog */}
      <Dialog open={formOpen || !!editStudent} onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditStudent(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              {editStudent ? 'Edit Student' : 'Admit New Student'}
            </DialogTitle>
          </DialogHeader>
          <StudentForm
            defaultValues={editStudent ? {
              id: editStudent.id,
              name: editStudent.name,
              nameBn: editStudent.nameBn,
              gender: editStudent.gender,
              status: editStudent.status,
              classId: editStudent.classId ? String(editStudent.classId) : undefined,
              sectionId: editStudent.sectionId ? String(editStudent.sectionId) : undefined,
            } : undefined}
            classes={classes}
            sections={sections}
            sessions={sessions}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
