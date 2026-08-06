'use client';

// ============================================================
// PayrollProcessor — Monthly payroll processing interface
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  FileText,
  CalendarDays,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  formatTaka,
  salaryStructures,
  getMonthName,
  type SalaryStructure,
} from '@/lib/payroll/sample-data';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { slideUp } from '@/lib/animations';

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.[0]?.toUpperCase() ?? '?';
}

interface PayrollProcessorProps {
  onViewPayslip?: (structure: SalaryStructure, month: number, year: number) => void;
}

export default function PayrollProcessor({ onViewPayslip }: PayrollProcessorProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(now.getFullYear());
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [absentDays, setAbsentDays] = React.useState<Record<string, number>>({});
  const [paidIds, setPaidIds] = React.useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === salaryStructures.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(salaryStructures.map((s) => s.id)));
    }
  };

  const getAbsentDays = (id: string) => absentDays[id] ?? 0;

  const getComputedNet = (s: SalaryStructure) => {
    const absent = getAbsentDays(s.id);
    const perDay = s.basicSalary / 30;
    const absentDeduction = Math.round(perDay * absent);
    return s.netSalary - absentDeduction;
  };

  const totalGross = salaryStructures.reduce((sum, s) => sum + s.grossSalary, 0);
  const totalDeductions = salaryStructures.reduce((sum, s) => {
    const absent = getAbsentDays(s.id);
    const perDay = s.basicSalary / 30;
    return sum + s.totalDeductions + Math.round(perDay * absent);
  }, 0);
  const totalNet = salaryStructures.reduce((sum, s) => sum + getComputedNet(s), 0);

  const handleProcessPayroll = () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No employees selected',
        description: 'Please select employees to process payroll.',
        variant: 'destructive',
      });
      return;
    }
    setPaidIds(new Set(selectedIds));
    toast({
      title: 'Payroll Processed',
      description: `Payroll processed for ${selectedIds.size} employee(s) for ${getMonthName(selectedMonth)} ${selectedYear}.`,
    });
  };

  const handleGeneratePayslips = () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No employees selected',
        description: 'Please select employees to generate payslips.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Payslips Generated',
      description: `Payslips generated for ${selectedIds.size} employee(s).`,
    });
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Month/Year Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <CalendarDays className="h-5 w-5 text-emerald-600" />
        <Select
          value={String(selectedMonth)}
          onValueChange={(v) => setSelectedMonth(Number(v))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {getMonthName(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-t-[3px] border-t-emerald-600">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Employees</p>
            <p className="text-lg font-bold">{salaryStructures.length}</p>
          </CardContent>
        </Card>
        <Card className="border-t-[3px] border-t-amber-600">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Gross</p>
            <p className="text-lg font-bold">{formatTaka(totalGross)}</p>
          </CardContent>
        </Card>
        <Card className="border-t-[3px] border-t-rose-600">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Deductions</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {formatTaka(totalDeductions)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-[3px] border-t-amber-600">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Net</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {formatTaka(totalNet)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table / Cards */}
      {isMobile ? (
        <div className="space-y-3">
          {salaryStructures.map((s) => {
            const isSelected = selectedIds.has(s.id);
            const isPaid = paidIds.has(s.id);
            const absent = getAbsentDays(s.id);
            const computedNet = getComputedNet(s);
            const perDay = s.basicSalary / 30;
            const absentDeduction = Math.round(perDay * absent);
            return (
              <Card
                key={s.id}
                className={`border ${isSelected ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(s.id)}
                      />
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {getInitials(s.employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{s.employee.name}</p>
                        <Badge
                          variant="outline"
                          className={
                            s.employee.type === 'teacher'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] px-1 py-0'
                              : 'border-amber-300 bg-amber-50 text-amber-700 text-[10px] px-1 py-0'
                          }
                        >
                          {s.employee.type === 'teacher' ? 'Teacher' : 'Employee'}
                        </Badge>
                      </div>
                    </div>
                    {isPaid ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Absent Days:</span>
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      value={absent}
                      onChange={(e) =>
                        setAbsentDays((prev) => ({
                          ...prev,
                          [s.id]: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className="h-7 w-16 text-xs"
                    />
                    {absentDeduction > 0 && (
                      <span className="text-rose-500">-{formatTaka(absentDeduction)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Net: </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatTaka(computedNet)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedIds.size === salaryStructures.length}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Basic</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Absent Days</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryStructures.map((s) => {
                const isSelected = selectedIds.has(s.id);
                const isPaid = paidIds.has(s.id);
                const absent = getAbsentDays(s.id);
                const computedNet = getComputedNet(s);
                const perDay = s.basicSalary / 30;
                const absentDeduction = Math.round(perDay * absent);
                const totalDed = s.totalDeductions + absentDeduction;

                return (
                  <TableRow
                    key={s.id}
                    className={isSelected ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(s.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            {getInitials(s.employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{s.employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          s.employee.type === 'teacher'
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                        }
                      >
                        {s.employee.type === 'teacher' ? 'Teacher' : 'Employee'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatTaka(s.basicSalary)}</TableCell>
                    <TableCell className="text-sm">{formatTaka(s.grossSalary)}</TableCell>
                    <TableCell className="text-sm text-rose-600 dark:text-rose-400">
                      {formatTaka(totalDed)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        value={absent}
                        onChange={(e) =>
                          setAbsentDays((prev) => ({
                            ...prev,
                            [s.id]: Math.max(0, parseInt(e.target.value) || 0),
                          }))
                        }
                        className="h-7 w-16 text-xs"
                      />
                    </TableCell>
                    <TableCell className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {formatTaka(computedNet)}
                    </TableCell>
                    <TableCell>
                      {isPaid ? (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleProcessPayroll}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          Process Payroll ({selectedIds.size} selected)
        </Button>
        <Button
          onClick={handleGeneratePayslips}
          variant="outline"
          className="gap-1.5"
        >
          <FileText className="h-4 w-4" />
          Generate Payslips
        </Button>
        {onViewPayslip && selectedIds.size === 1 && (
          <Button
            onClick={() => {
              const id = Array.from(selectedIds)[0];
              const struct = salaryStructures.find((s) => s.id === id);
              if (struct) onViewPayslip(struct, selectedMonth, selectedYear);
            }}
            variant="outline"
            className="gap-1.5"
          >
            <FileText className="h-4 w-4" />
            View Payslip
          </Button>
        )}
      </div>
    </motion.div>
  );
}
