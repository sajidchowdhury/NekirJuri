'use client';

// ============================================================
// SalaryStructureList — DataTable of salary structures with filter tabs
// Data fetched from /api/salary-structures via useQuery
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  type ColumnDef,
} from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/organisms/data-table';
import {
  formatTaka,
  type SalaryStructure,
  type Employee,
} from '@/lib/payroll/sample-data';
import { fadeIn } from '@/lib/animations';

interface SalaryStructureListProps {
  onView?: (structure: SalaryStructure) => void;
  onEdit?: (structure: SalaryStructure) => void;
}

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? '?';
}

/** Map API salary-structure response to SalaryStructure shape */
function mapApiSalaryStructure(raw: Record<string, unknown>): SalaryStructure {
  const teacherOrEmployee = (raw.teacher ?? raw.employee) as Record<string, unknown> | undefined;
  const empName = String(teacherOrEmployee?.name ?? '');
  const empType = (teacherOrEmployee?.type ?? 'employee') as 'teacher' | 'employee';

  const employee: Employee = {
    id: String(teacherOrEmployee?.id ?? raw.teacherId ?? raw.employeeId ?? ''),
    name: empName,
    nameBn: String(teacherOrEmployee?.nameBn ?? ''),
    type: empType,
    department: String(teacherOrEmployee?.department ?? ''),
    designation: String(teacherOrEmployee?.designation ?? ''),
    employeeId: String(teacherOrEmployee?.employeeId ?? teacherOrEmployee?.employee_id ?? ''),
    photoUrl: teacherOrEmployee?.photoUrl as string | undefined,
  };

  const basicSalary = Number(raw.basicSalary ?? 0);
  const houseRent = Number(raw.houseRent ?? 0);
  const medicalAllowance = Number(raw.medicalAllowance ?? 0);
  const transportAllowance = Number(raw.transportAllowance ?? 0);
  const specialAllowance = Number(raw.specialAllowance ?? raw.otherAllowance ?? 0);
  const providentFund = Number(raw.pfDeduction ?? raw.providentFund ?? 0);
  const taxDeduction = Number(raw.taxDeduction ?? 0);
  const otherDeduction = Number(raw.otherDeduction ?? 0);

  const grossSalary = Number(raw.grossSalary ?? raw.totalSalary ?? (basicSalary + houseRent + medicalAllowance + transportAllowance + specialAllowance));
  const totalDeductions = Number(raw.totalDeductions ?? (providentFund + taxDeduction + otherDeduction));
  const netSalary = Number(raw.netSalary ?? (grossSalary - totalDeductions));

  return {
    id: String(raw.id ?? ''),
    employeeId: String(raw.employeeId ?? raw.teacherId ?? ''),
    employee,
    basicSalary,
    houseRent,
    medicalAllowance,
    transportAllowance,
    specialAllowance,
    providentFund,
    taxDeduction,
    otherDeduction,
    grossSalary,
    totalDeductions,
    netSalary,
  };
}

export default function SalaryStructureList({ onView, onEdit }: SalaryStructureListProps) {
  const [filter, setFilter] = React.useState<'all' | 'teacher' | 'employee'>('all');

  const { data: salaryStructures = [], isLoading } = useQuery<SalaryStructure[]>({
    queryKey: ['salary-structures'],
    queryFn: async () => {
      const res = await fetch('/api/salary-structures?limit=100');
      if (!res.ok) throw new Error('Failed to fetch salary structures');
      const json = await res.json();
      const rawList: unknown[] = json.data ?? json;
      return rawList.map((r) => mapApiSalaryStructure(r as Record<string, unknown>));
    },
  });

  const filteredData = React.useMemo(() => {
    if (filter === 'all') return salaryStructures;
    return salaryStructures.filter((s) => s.employee.type === filter);
  }, [salaryStructures, filter]);

  const columns: ColumnDef<SalaryStructure, unknown>[] = React.useMemo(
    () => [
      {
        accessorKey: 'employee.name',
        header: 'Employee / Teacher',
        cell: ({ row }) => {
          const emp = row.original.employee;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                  {getInitials(emp.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{emp.name}</span>
                <span className="text-xs text-muted-foreground">{emp.designation}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'employee.type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.employee.type;
          return (
            <Badge
              variant="outline"
              className={
                type === 'teacher'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
              }
            >
              {type === 'teacher' ? 'Teacher' : 'Employee'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'basicSalary',
        header: 'Basic Salary',
        cell: ({ row }) => (
          <span className="text-sm">{formatTaka(row.original.basicSalary)}</span>
        ),
      },
      {
        id: 'totalAllowances',
        header: 'Total Allowances',
        cell: ({ row }) => {
          const s = row.original;
          const total = s.houseRent + s.medicalAllowance + s.transportAllowance + s.specialAllowance;
          return <span className="text-sm">{formatTaka(total)}</span>;
        },
      },
      {
        accessorKey: 'totalDeductions',
        header: 'Total Deductions',
        cell: ({ row }) => (
          <span className="text-sm text-rose-600 dark:text-rose-400">
            {formatTaka(row.original.totalDeductions)}
          </span>
        ),
      },
      {
        accessorKey: 'netSalary',
        header: 'Net Salary',
        cell: ({ row }) => (
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {formatTaka(row.original.netSalary)}
          </span>
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
              <DropdownMenuItem
                onClick={() => onView?.(row.original)}
                className="gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit?.(row.original)}
                className="gap-2 cursor-pointer"
              >
                <Edit className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onView, onEdit]
  );

  const renderCard = (item: SalaryStructure) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px]">
              {getInitials(item.employee.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{item.employee.name}</span>
        </div>
        <Badge
          variant="outline"
          className={
            item.employee.type === 'teacher'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
          }
        >
          {item.employee.type === 'teacher' ? 'Teacher' : 'Employee'}
        </Badge>
      </div>
      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
        {formatTaka(item.netSalary)}
      </p>
      <p className="text-xs text-muted-foreground">
        Basic: {formatTaka(item.basicSalary)} · Deductions: {formatTaka(item.totalDeductions)}
      </p>
    </div>
  );

  const filterTabs: { key: 'all' | 'teacher' | 'employee'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'teacher', label: 'Teachers' },
    { key: 'employee', label: 'Employees' },
  ];

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(tab.key)}
            className={
              filter === tab.key
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : ''
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search salary structures..."
        sortable
        paginated
        pageSize={10}
        renderCard={renderCard}
      />
    </motion.div>
  );
}
