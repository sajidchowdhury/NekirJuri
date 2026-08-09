'use client';

// ============================================================
// SalaryStructureForm — Add/Edit salary structure with auto-calculation
// Employee dropdown fetched from /api/teachers + /api/employees
// Submit POSTs to /api/salary-structures
// ============================================================

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiSubmit } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  formatTaka,
  type SalaryStructure,
  type Employee,
} from '@/lib/payroll/sample-data';
import { toast } from 'sonner';

const schema = z.object({
  employeeId: z.string().min(1, 'Select an employee'),
  basicSalary: z.coerce.number().min(1, 'Basic salary is required'),
  houseRent: z.coerce.number().min(0, 'House rent must be >= 0'),
  medicalAllowance: z.coerce.number().min(0, 'Medical allowance must be >= 0'),
  transportAllowance: z.coerce.number().min(0, 'Transport allowance must be >= 0'),
  specialAllowance: z.coerce.number().min(0, 'Special allowance must be >= 0'),
  providentFund: z.coerce.number().min(0, 'Provident fund must be >= 0'),
  taxDeduction: z.coerce.number().min(0, 'Tax deduction must be >= 0'),
  otherDeduction: z.coerce.number().min(0, 'Other deduction must be >= 0'),
});

type FormData = z.infer<typeof schema>;

interface SalaryStructureFormProps {
  editDefaults?: SalaryStructure;
  onSuccess?: () => void;
}

/** Normalize an API teacher/employee object to our Employee shape */
function normalizeEmployee(raw: Record<string, unknown>, type: 'teacher' | 'employee'): Employee {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    nameBn: String(raw.nameBn ?? raw.name_bn ?? ''),
    type,
    department: String(raw.department ?? ''),
    designation: String(raw.designation ?? ''),
    employeeId: String(raw.employeeId ?? raw.employee_id ?? ''),
    photoUrl: raw.photoUrl as string | undefined,
  };
}

export default function SalaryStructureForm({
  editDefaults,
  onSuccess,
}: SalaryStructureFormProps) {
  const queryClient = useQueryClient();
  const [allowancesOpen, setAllowancesOpen] = React.useState(true);
  const [deductionsOpen, setDeductionsOpen] = React.useState(true);

  // Fetch teachers from API
  const { data: teachers = [] } = useQuery<Employee[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await fetch('/api/teachers?limit=100');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const json = await res.json();
      const rawList: unknown[] = json.data ?? json;
      return rawList.map((r) => normalizeEmployee(r as Record<string, unknown>, 'teacher'));
    },
  });

  // Fetch employees from API
  const { data: staff = [] } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await fetch('/api/employees?limit=100');
      if (!res.ok) throw new Error('Failed to fetch employees');
      const json = await res.json();
      const rawList: unknown[] = json.data ?? json;
      return rawList.map((r) => normalizeEmployee(r as Record<string, unknown>, 'employee'));
    },
  });

  // Combine teachers and employees for the dropdown
  const employees = React.useMemo(() => [...teachers, ...staff], [teachers, staff]);

  // Determine employee type for a given employeeId
  const getEmployeeType = (id: string): 'teacher' | 'employee' | null => {
    const emp = employees.find((e) => e.id === id);
    return emp?.type ?? null;
  };

  const defaultEmployee = editDefaults
    ? employees.find((e) => e.id === editDefaults.employeeId)
    : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: editDefaults
      ? {
          employeeId: editDefaults.employeeId,
          basicSalary: editDefaults.basicSalary,
          houseRent: editDefaults.houseRent,
          medicalAllowance: editDefaults.medicalAllowance,
          transportAllowance: editDefaults.transportAllowance,
          specialAllowance: editDefaults.specialAllowance,
          providentFund: editDefaults.providentFund,
          taxDeduction: editDefaults.taxDeduction,
          otherDeduction: editDefaults.otherDeduction,
        }
      : {
          employeeId: '',
          basicSalary: 0,
          houseRent: 0,
          medicalAllowance: 2000,
          transportAllowance: 1500,
          specialAllowance: 0,
          providentFund: 0,
          taxDeduction: 0,
          otherDeduction: 0,
        },
  });

  const watched = watch();
  const selectedEmployee = employees.find((e) => e.id === watched.employeeId);

  // Auto-calculate
  const grossSalary =
    watched.basicSalary +
    watched.houseRent +
    watched.medicalAllowance +
    watched.transportAllowance +
    watched.specialAllowance;

  const totalDeductions =
    watched.providentFund + watched.taxDeduction + watched.otherDeduction;

  const netSalary = grossSalary - totalDeductions;

  // Auto-fill defaults when basic salary changes or employee selected
  const handleEmployeeChange = (value: string) => {
    setValue('employeeId', value);
  };

  const handleBasicSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setValue('basicSalary', val);
    // Auto-calc defaults
    setValue('houseRent', Math.round(val * 0.4));
    setValue('providentFund', Math.round(val * 0.1));
  };

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      const employeeType = getEmployeeType(data.employeeId);
      const body: Record<string, unknown> = {
        employeeType,
        basicSalary: data.basicSalary,
        houseRent: data.houseRent,
        medicalAllowance: data.medicalAllowance,
        transportAllowance: data.transportAllowance,
        otherAllowance: data.specialAllowance,
        pfDeduction: data.providentFund,
        taxDeduction: data.taxDeduction,
        otherDeduction: data.otherDeduction,
        effectiveFrom: new Date().toISOString().split('T')[0],
      };

      // Set teacherId or employeeId depending on type
      if (employeeType === 'teacher') {
        body.teacherId = data.employeeId;
      } else {
        body.employeeId = data.employeeId;
      }

      if (editDefaults) {
        return apiSubmit(`/api/salary-structures/${editDefaults.id}`, 'PUT', body);
      }
      return apiSubmit('/api/salary-structures', 'POST', body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] });
      toast.success(
        editDefaults ? 'Salary Structure Updated' : 'Salary Structure Created',
        {
          description: `Salary structure for ${selectedEmployee?.name ?? 'employee'} has been ${editDefaults ? 'updated' : 'created'} successfully.`,
        }
      );
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to save salary structure');
    },
  });

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  // isSubmitting should reflect mutation state
  const submitting = saveMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Employee Selector */}
      <div className="space-y-2">
        <Label>Employee / Teacher</Label>
        <Select
          value={watched.employeeId}
          onValueChange={handleEmployeeChange}
          disabled={!!editDefaults}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employee or teacher" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                <div className="flex items-center gap-2">
                  <span>{emp.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      emp.type === 'teacher'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] px-1 py-0'
                        : 'border-amber-300 bg-amber-50 text-amber-700 text-[10px] px-1 py-0'
                    }
                  >
                    {emp.type === 'teacher' ? 'T' : 'E'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEmployee && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className={
                selectedEmployee.type === 'teacher'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
              }
            >
              {selectedEmployee.type === 'teacher' ? 'Teacher' : 'Employee'}
            </Badge>
            <span>{selectedEmployee.department} · {selectedEmployee.designation}</span>
          </div>
        )}
        {errors.employeeId && (
          <p className="text-xs text-rose-500">{errors.employeeId.message}</p>
        )}
      </div>

      {/* Basic Salary */}
      <div className="space-y-2">
        <Label>Basic Salary (৳)</Label>
        <Input
          type="number"
          {...register('basicSalary', { valueAsNumber: true })}
          onChange={handleBasicSalaryChange}
          placeholder="Enter basic salary"
        />
        {errors.basicSalary && (
          <p className="text-xs text-rose-500">{errors.basicSalary.message}</p>
        )}
      </div>

      {/* Allowances Section (expandable) */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setAllowancesOpen(!allowancesOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span>Allowances</span>
          {allowancesOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {allowancesOpen && (
          <div className="px-4 pb-4 space-y-3 border-t pt-3">
            <div className="space-y-1">
              <Label className="text-xs">House Rent (৳) <span className="text-muted-foreground">— default 40% of basic</span></Label>
              <Input type="number" {...register('houseRent', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Medical Allowance (৳) <span className="text-muted-foreground">— default ৳2,000</span></Label>
              <Input type="number" {...register('medicalAllowance', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Transport Allowance (৳) <span className="text-muted-foreground">— default ৳1,500</span></Label>
              <Input type="number" {...register('transportAllowance', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Special Allowance (৳) <span className="text-muted-foreground">— default 0</span></Label>
              <Input type="number" {...register('specialAllowance', { valueAsNumber: true })} />
            </div>
          </div>
        )}
      </div>

      {/* Deductions Section (expandable) */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setDeductionsOpen(!deductionsOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
        >
          <span>Deductions</span>
          {deductionsOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {deductionsOpen && (
          <div className="px-4 pb-4 space-y-3 border-t pt-3">
            <div className="space-y-1">
              <Label className="text-xs">Provident Fund (৳) <span className="text-muted-foreground">— default 10% of basic</span></Label>
              <Input type="number" {...register('providentFund', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tax Deduction (৳) <span className="text-muted-foreground">— default 0</span></Label>
              <Input type="number" {...register('taxDeduction', { valueAsNumber: true })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Other Deduction (৳) <span className="text-muted-foreground">— default 0</span></Label>
              <Input type="number" {...register('otherDeduction', { valueAsNumber: true })} />
            </div>
          </div>
        )}
      </div>

      {/* Auto-calculated Summary */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Gross Salary</span>
          <span className="font-medium">{formatTaka(grossSalary)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-rose-600 dark:text-rose-400">Total Deductions</span>
          <span className="font-medium text-rose-600 dark:text-rose-400">
            {formatTaka(totalDeductions)}
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between">
          <span className="font-semibold">Net Salary</span>
          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatTaka(netSalary)}
          </span>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        {submitting
          ? 'Saving...'
          : editDefaults
            ? 'Update Salary Structure'
            : 'Create Salary Structure'}
      </Button>
    </form>
  );
}
