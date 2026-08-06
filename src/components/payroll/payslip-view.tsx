'use client';

// ============================================================
// PayslipView — Print-optimized payslip card
// ============================================================

import * as React from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BismillahHeader from '@/components/islamic/bismillah-header';
import {
  formatTaka,
  getMonthName,
  type SalaryStructure,
} from '@/lib/payroll/sample-data';

interface PayslipViewProps {
  structure: SalaryStructure;
  month: number;
  year: number;
  absentDays?: number;
}

export default function PayslipView({
  structure,
  month,
  year,
  absentDays = 0,
}: PayslipViewProps) {
  const s = structure;
  const perDaySalary = s.basicSalary / 30;
  const absentDeduction = Math.round(perDaySalary * absentDays);
  const adjustedNet = s.netSalary - absentDeduction;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print:p-0">
      <div className="border-t-[3px] border-t-emerald-600 bg-white dark:bg-card rounded-lg shadow-sm max-w-lg mx-auto">
        {/* Bismillah */}
        <div className="pt-4">
          <BismillahHeader size="sm" showTranslation />
        </div>

        {/* Institution Info */}
        <div className="text-center px-6 py-3">
          <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
            Al-Huda Islamic Academy
          </h2>
          <p className="text-xs text-muted-foreground">
            Vill: Chandpur, Upazila: Daudkandi, Dist: Comilla, Bangladesh
          </p>
          <Separator className="my-2 bg-amber-300 dark:bg-amber-700" />
          <h3 className="text-sm font-semibold tracking-wider uppercase">
            Salary Slip — {getMonthName(month)} {year}
          </h3>
        </div>

        {/* Employee Info */}
        <div className="px-6 py-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <span className="text-muted-foreground">Name: </span>
              <span className="font-medium">{s.employee.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Employee ID: </span>
              <span className="font-medium">{s.employee.employeeId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Department: </span>
              <span className="font-medium">{s.employee.department}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Designation: </span>
              <span className="font-medium">{s.employee.designation}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Type: </span>
              <span className="font-medium capitalize">{s.employee.type}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Earnings */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              Earnings
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Basic Salary</span>
                <span>{formatTaka(s.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>House Rent</span>
                <span>{formatTaka(s.houseRent)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Medical Allowance</span>
                <span>{formatTaka(s.medicalAllowance)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Transport Allowance</span>
                <span>{formatTaka(s.transportAllowance)}</span>
              </div>
              {s.specialAllowance > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Special Allowance</span>
                  <span>{formatTaka(s.specialAllowance)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Total Earnings</span>
                <span>{formatTaka(s.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
              Deductions
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Provident Fund</span>
                <span>{formatTaka(s.providentFund)}</span>
              </div>
              {s.taxDeduction > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Tax Deduction</span>
                  <span>{formatTaka(s.taxDeduction)}</span>
                </div>
              )}
              {s.otherDeduction > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Other Deduction</span>
                  <span>{formatTaka(s.otherDeduction)}</span>
                </div>
              )}
              {absentDeduction > 0 && (
                <div className="flex justify-between text-xs">
                  <span>Absent Deduction ({absentDays} days)</span>
                  <span>{formatTaka(absentDeduction)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>Total Deductions</span>
                <span>{formatTaka(s.totalDeductions + absentDeduction)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-muted-foreground mb-1">Net Pay</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatTaka(adjustedNet)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="border-b border-foreground/30 pb-8 mb-1" />
              <span className="text-muted-foreground">Received by</span>
            </div>
            <div className="text-center">
              <div className="border-b border-foreground/30 pb-8 mb-1" />
              <span className="text-muted-foreground">Date</span>
            </div>
            <div className="text-center">
              <div className="border-b border-dashed border-foreground/20 pb-8 mb-1" />
              <span className="text-muted-foreground">Stamp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-4 flex justify-center print:hidden">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="gap-1.5"
        >
          <Printer className="h-4 w-4" />
          Print Payslip
        </Button>
      </div>
    </div>
  );
}
