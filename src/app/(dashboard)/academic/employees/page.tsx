'use client';

// ============================================================
// Employees Page — List, search, and manage employees
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import PageHeader from '@/components/atoms/page-header';
import { DataTable } from '@/components/organisms/data-table';
import ExportButton from '@/components/molecules/export-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatusBadge from '@/components/atoms/status-badge';
import EmployeeForm from '@/components/academic/employee-form';
import { slideUp, transitions } from '@/lib/animations';
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { apiDelete } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────

interface Employee {
  id: number;
  name: string;
  employeeIdNo: string;
  phone?: string;
  department?: string;
  designation?: string;
  status: string;
  photoUrl?: string;
  gender?: string;
}

// ── Page ─────────────────────────────────────────────────

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editEmployee, setEditEmployee] = React.useState<Employee | null>(null);

  const {
    data: employeesResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await fetch('/api/employees?limit=100');
      if (!res.ok) throw new Error('Failed to fetch employees');
      return res.json();
    },
  });

  const employees: Employee[] = employeesResponse?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/employees/${id}`),
    onSuccess: () => {
      toast.success('Employee deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete employee');
    },
  });

  const handleDelete = (employee: Employee) => {
    if (confirm(`Are you sure you want to delete ${employee.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(employee.id);
    }
  };

  const columns: ColumnDef<Employee, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => {
        const e = row.original;
        const initials = e.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={e.photoUrl} alt={e.name} />
              <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{e.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'employeeIdNo',
      header: 'Employee ID',
      cell: ({ row }) => <Badge variant="outline" className="text-xs font-mono">{row.original.employeeIdNo}</Badge>,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <Badge variant="secondary" className="text-xs">{row.original.department || '—'}</Badge>,
    },
    {
      accessorKey: 'designation',
      header: 'Designation',
      cell: ({ row }) => <span className="text-sm">{row.original.designation || '—'}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.phone || '—'}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status as 'active' | 'inactive'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2 cursor-pointer"><Eye className="h-4 w-4" /> View</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setEditEmployee(row.original)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600" onClick={() => handleDelete(row.original)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const renderCard = (emp: Employee) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium truncate">{emp.name}</span>
        <span className="text-xs text-muted-foreground">{emp.department || 'N/A'} • {emp.designation || 'N/A'}</span>
      </div>
      <StatusBadge status={emp.status as 'active' | 'inactive'} className="ml-auto shrink-0" />
    </div>
  );

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditEmployee(null);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  // Error state
  if (isError) {
    return (
      <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="flex flex-col gap-6">
        <PageHeader title="Employees" description="Manage employee records, departments, and employment details" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load employees</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching employee data. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="flex flex-col gap-6">
      <PageHeader
        title="Employees"
        description="Manage employee records, departments, and employment details"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton onExportCSV={() => toast.info('CSV export coming soon')} onExportPDF={() => toast.info('PDF export coming soon')} />
            <Button onClick={() => { setEditEmployee(null); setFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </div>
        }
      />
      <DataTable columns={columns} data={employees} searchable searchPlaceholder="Search employees..." sortable paginated isLoading={isLoading} emptyMessage="No employees found" emptyDescription="Add your first employee to get started." renderCard={renderCard} />
      <Dialog open={formOpen || !!editEmployee} onOpenChange={(open) => { if (!open) { setFormOpen(false); setEditEmployee(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-600" />{editEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm defaultValues={editEmployee ? { id: editEmployee.id, name: editEmployee.name, phone: editEmployee.phone, employeeIdNo: editEmployee.employeeIdNo, department: editEmployee.department, designation: editEmployee.designation, gender: editEmployee.gender } : undefined} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
