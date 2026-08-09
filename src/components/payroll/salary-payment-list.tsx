'use client';

// ============================================================
// SalaryPaymentList — DataTable of processed salary payments
// Data fetched from /api/salary-payments via useQuery
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { type ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Printer, MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/organisms/data-table';
import {
  formatTaka,
  getMonthName,
  type SalaryPayment,
  type Employee,
} from '@/lib/payroll/sample-data';
import { fadeIn } from '@/lib/animations';

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? '?';
}

/** Map API salary-payment response to SalaryPayment shape */
function mapApiSalaryPayment(raw: Record<string, unknown>): SalaryPayment {
  const structureOrEmployee = (raw.salaryStructure ?? raw.teacher ?? raw.employee) as Record<string, unknown> | undefined;
  const empSource = (structureOrEmployee?.teacher ?? structureOrEmployee?.employee ?? structureOrEmployee) as Record<string, unknown> | undefined;
  const empName = String(empSource?.name ?? '');
  const empType = (empSource?.type ?? 'employee') as 'teacher' | 'employee';

  const employee: Employee = {
    id: String(empSource?.id ?? ''),
    name: empName,
    nameBn: String(empSource?.nameBn ?? ''),
    type: empType,
    department: String(empSource?.department ?? ''),
    designation: String(empSource?.designation ?? ''),
    employeeId: String(empSource?.employeeId ?? empSource?.employee_id ?? ''),
    photoUrl: empSource?.photoUrl as string | undefined,
  };

  return {
    id: String(raw.id ?? ''),
    salaryStructureId: String(raw.salaryStructureId ?? raw.salary_structure_id ?? (raw.salaryStructure as Record<string, unknown> | undefined)?.id ?? ''),
    employee,
    month: Number(raw.month ?? 1),
    year: Number(raw.year ?? new Date().getFullYear()),
    grossSalary: Number(raw.grossSalary ?? raw.gross_salary ?? 0),
    totalDeductions: Number(raw.totalDeductions ?? raw.total_deductions ?? 0),
    netSalary: Number(raw.netSalary ?? raw.net_salary ?? 0),
    absentDays: Number(raw.absentDays ?? raw.absent_days ?? 0),
    absentDeduction: Number(raw.absentDeduction ?? raw.absent_deduction ?? 0),
    paymentDate: String(raw.paymentDate ?? raw.payment_date ?? ''),
    status: (raw.status as 'paid' | 'pending') ?? 'pending',
  };
}

interface SalaryPaymentListProps {
  onViewPayslip?: (payment: SalaryPayment) => void;
}

export default function SalaryPaymentList({ onViewPayslip }: SalaryPaymentListProps) {
  const now = new Date();
  const [filterMonth, setFilterMonth] = React.useState<string>(String(now.getMonth() + 1));
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  const { data: salaryPayments = [], isLoading } = useQuery<SalaryPayment[]>({
    queryKey: ['salary-payments'],
    queryFn: async () => {
      const res = await fetch('/api/salary-payments?limit=100');
      if (!res.ok) throw new Error('Failed to fetch salary payments');
      const json = await res.json();
      const rawList: unknown[] = json.data ?? json;
      return rawList.map((r) => mapApiSalaryPayment(r as Record<string, unknown>));
    },
  });

  const filteredData = React.useMemo(() => {
    let data = salaryPayments;
    if (filterMonth !== 'all') {
      data = data.filter((p) => p.month === Number(filterMonth));
    }
    if (filterStatus !== 'all') {
      data = data.filter((p) => p.status === filterStatus);
    }
    return data;
  }, [salaryPayments, filterMonth, filterStatus]);

  const columns: ColumnDef<SalaryPayment, unknown>[] = React.useMemo(
    () => [
      {
        accessorKey: 'employee.name',
        header: 'Employee',
        cell: ({ row }) => {
          const emp = row.original.employee;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                  {getInitials(emp.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{emp.name}</span>
            </div>
          );
        },
      },
      {
        id: 'monthYear',
        header: 'Month/Year',
        cell: ({ row }) => (
          <span className="text-sm">
            {getMonthName(row.original.month)} {row.original.year}
          </span>
        ),
      },
      {
        accessorKey: 'grossSalary',
        header: 'Gross Salary',
        cell: ({ row }) => (
          <span className="text-sm">{formatTaka(row.original.grossSalary)}</span>
        ),
      },
      {
        accessorKey: 'totalDeductions',
        header: 'Deductions',
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
        accessorKey: 'paymentDate',
        header: 'Payment Date',
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.paymentDate || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return status === 'paid' ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Paid
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Pending
            </Badge>
          );
        },
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
                onClick={() => onViewPayslip?.(row.original)}
                className="gap-2 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                View Payslip
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => window.print()}
                className="gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onViewPayslip]
  );

  const renderCard = (item: SalaryPayment) => (
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
        {item.status === 'paid' ? (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            Paid
          </Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Pending
          </Badge>
        )}
      </div>
      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
        {formatTaka(item.netSalary)}
      </p>
      <p className="text-xs text-muted-foreground">
        {getMonthName(item.month)} {item.year} · Gross: {formatTaka(item.grossSalary)}
      </p>
    </div>
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <motion.div variants={fadeIn} initial="initial" animate="animate" className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {getMonthName(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search payments..."
        sortable
        paginated
        pageSize={10}
        renderCard={renderCard}
      />
    </motion.div>
  );
}
