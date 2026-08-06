'use client';

// ============================================================
// Teachers Page — List, search, and manage teachers
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/atoms/page-header';
import { DataTable } from '@/components/organisms/data-table';
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
import TeacherForm from '@/components/academic/teacher-form';
import { slideUp, transitions } from '@/lib/animations';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, UserCog } from 'lucide-react';

// ── Sample data ──────────────────────────────────────────

const sampleTeachers = [
  { id: 1, name: 'Maulana Ahmad Ali', employeeIdNo: 'TCH-001', phone: '+880 1711-111111', qualification: 'M.A. Islamic Studies', specialization: 'Quran & Hadith', status: 'active', photoUrl: '', gender: 'Male' },
  { id: 2, name: 'Hafiz Mohammad Yunus', employeeIdNo: 'TCH-002', phone: '+880 1711-222222', qualification: 'Hifz Certificate', specialization: 'Hifz', status: 'active', photoUrl: '', gender: 'Male' },
  { id: 3, name: 'Ms. Rabeya Khatun', employeeIdNo: 'TCH-003', phone: '+880 1711-333333', qualification: 'B.Ed', specialization: 'Mathematics', status: 'active', photoUrl: '', gender: 'Female' },
  { id: 4, name: 'Maulana Ishaq Siddiqui', employeeIdNo: 'TCH-004', phone: '+880 1711-444444', qualification: 'M.Sc. Physics', specialization: 'Science', status: 'active', photoUrl: '', gender: 'Male' },
  { id: 5, name: 'Ms. Nasreen Jahan', employeeIdNo: 'TCH-005', phone: '+880 1711-555555', qualification: 'B.A. English', specialization: 'English', status: 'inactive', photoUrl: '', gender: 'Female' },
];

type Teacher = typeof sampleTeachers[number];

export default function TeachersPage() {
  const [formOpen, setFormOpen] = React.useState(false);
  const [editTeacher, setEditTeacher] = React.useState<Teacher | null>(null);

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/teachers');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        return json.data?.length ? json.data : null;
      } catch {
        return null;
      }
    },
  });

  const teachers: Teacher[] = teachersData || sampleTeachers;

  const columns: ColumnDef<Teacher, unknown>[] = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Teacher',
      cell: ({ row }) => {
        const t = row.original;
        const initials = t.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={t.photoUrl} alt={t.name} />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{t.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'employeeIdNo',
      header: 'Employee ID',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-mono">{row.original.employeeIdNo}</Badge>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: 'qualification',
      header: 'Qualification',
    },
    {
      accessorKey: 'specialization',
      header: 'Subject',
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">{row.original.specialization}</Badge>
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
            <DropdownMenuItem className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setEditTeacher(row.original)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600" onClick={() => toast.info('Delete not available in preview')}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const renderCard = (teacher: Teacher) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          {teacher.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium truncate">{teacher.name}</span>
        <span className="text-xs text-muted-foreground">{teacher.specialization} • {teacher.employeeIdNo}</span>
      </div>
      <StatusBadge status={teacher.status as 'active' | 'inactive'} className="ml-auto shrink-0" />
    </div>
  );

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Teachers"
        description="Manage teacher profiles, assignments, and qualifications"
        showBismillah
        actions={
          <div className="flex items-center gap-2">
            <ExportButton
              onExportCSV={() => toast.info('CSV export coming soon')}
              onExportPDF={() => toast.info('PDF export coming soon')}
            />
            <Button onClick={() => { setEditTeacher(null); setFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={teachers}
        searchable
        searchPlaceholder="Search teachers..."
        sortable
        paginated
        isLoading={isLoading}
        emptyMessage="No teachers found"
        emptyDescription="Add your first teacher to get started."
        renderCard={renderCard}
      />

      <Dialog open={formOpen || !!editTeacher} onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditTeacher(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-600" />
              {editTeacher ? 'Edit Teacher' : 'Add New Teacher'}
            </DialogTitle>
          </DialogHeader>
          <TeacherForm
            defaultValues={editTeacher ? {
              id: editTeacher.id,
              name: editTeacher.name,
              phone: editTeacher.phone,
              employeeIdNo: editTeacher.employeeIdNo,
              qualification: editTeacher.qualification,
              specialization: editTeacher.specialization,
              gender: editTeacher.gender,
            } : undefined}
            onSuccess={() => { setFormOpen(false); setEditTeacher(null); }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
