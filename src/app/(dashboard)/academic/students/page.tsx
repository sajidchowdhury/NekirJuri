'use client';

// ============================================================
// Students Page — List, search, filter, and manage students
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, GraduationCap } from 'lucide-react';

// ── Sample data ──────────────────────────────────────────

const sampleStudents = [
  { id: 1, name: 'Abdullah Rahim', nameBn: 'আব্দুল্লাহ রহিম', className: 'Class 8', section: 'A', roll: '01', gender: 'Male', status: 'active', phone: '+880 1712-345678', photoUrl: '', classId: 3, sectionId: 1 },
  { id: 2, name: 'Fatima Khatun', nameBn: 'ফাতিমা খাতুন', className: 'Class 5', section: 'B', roll: '05', gender: 'Female', status: 'active', phone: '+880 1812-345678', photoUrl: '', classId: 2, sectionId: 2 },
  { id: 3, name: 'Mohammad Hasan', nameBn: 'মোহাম্মদ হাসান', className: 'Class 10', section: 'A', roll: '12', gender: 'Male', status: 'active', phone: '+880 1512-345678', photoUrl: '', classId: 5, sectionId: 1 },
  { id: 4, name: 'Aisha Begum', nameBn: 'আয়শা বেগম', className: 'Hifz', section: 'A', roll: '03', gender: 'Female', status: 'active', phone: '+880 1612-345678', photoUrl: '', classId: 4, sectionId: 1 },
  { id: 5, name: 'Ibrahim Khan', nameBn: 'ইব্রাহিম খান', className: 'Class 6', section: 'C', roll: '08', gender: 'Male', status: 'inactive', phone: '+880 1912-345678', photoUrl: '', classId: 6, sectionId: 3 },
  { id: 6, name: 'Zainab Akter', nameBn: 'জায়নাব আক্তার', className: 'Class 8', section: 'B', roll: '15', gender: 'Female', status: 'active', phone: '+880 1312-345678', photoUrl: '', classId: 3, sectionId: 2 },
  { id: 7, name: 'Omar Farooq', nameBn: 'ওমর ফারুক', className: 'Class 5', section: 'A', roll: '22', gender: 'Male', status: 'active', phone: '+880 1412-345678', photoUrl: '', classId: 2, sectionId: 1 },
];

const sampleClasses = [
  { id: 1, name: 'Class 1', code: 'C1' },
  { id: 2, name: 'Class 5', code: 'C5' },
  { id: 3, name: 'Class 8', code: 'C8' },
  { id: 4, name: 'Hifz', code: 'HF' },
  { id: 5, name: 'Class 10', code: 'C10' },
  { id: 6, name: 'Class 6', code: 'C6' },
];

const sampleSections = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' },
];

const sampleSessions = [
  { id: 1, name: '2025-2026' },
  { id: 2, name: '2026-2027' },
];

// ── Types ────────────────────────────────────────────────

type Student = typeof sampleStudents[number];

// ── Page ─────────────────────────────────────────────────

export default function StudentsPage() {
  const [filters, setFilters] = React.useState<StudentFilterValues>({});
  const [formOpen, setFormOpen] = React.useState(false);
  const [editStudent, setEditStudent] = React.useState<Student | null>(null);

  // Fetch students
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.classId) params.set('classId', filters.classId);
        if (filters.sectionId) params.set('sectionId', filters.sectionId);
        if (filters.status) params.set('status', filters.status);
        const res = await fetch(`/api/students?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        return json.data?.length ? json.data : null;
      } catch {
        return null;
      }
    },
  });

  // Use sample data when no API data
  const students: Student[] = studentsData || sampleStudents;

  // Filter by gender client-side (since API doesn't support it directly)
  const filteredStudents = React.useMemo(() => {
    let result = students;
    if (filters.gender) {
      result = result.filter((s) => s.gender === filters.gender);
    }
    return result;
  }, [students, filters.gender]);

  // Columns
  const columns: ColumnDef<Student, unknown>[] = React.useMemo(() => [
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
        <Badge variant="secondary" className="text-xs">{row.original.className}</Badge>
      ),
    },
    {
      accessorKey: 'section',
      header: 'Section',
    },
    {
      accessorKey: 'roll',
      header: 'Roll',
    },
    {
      accessorKey: 'phone',
      header: 'Guardian Phone',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.phone}</span>
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
            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600" onClick={() => toast.info('Delete not available in preview')}>
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

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
        classes={sampleClasses}
        sections={sampleSections}
        sessions={sampleSessions}
      />

      {/* Data table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        searchable
        searchPlaceholder="Search students..."
        sortable
        paginated
        pageSize={10}
        isLoading={isLoading}
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
              classId: String(editStudent.classId),
              sectionId: String(editStudent.sectionId),
            } : undefined}
            classes={sampleClasses}
            sections={sampleSections}
            sessions={sampleSessions}
            onSuccess={() => { setFormOpen(false); setEditStudent(null); }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
