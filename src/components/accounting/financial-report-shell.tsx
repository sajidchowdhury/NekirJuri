'use client';

// ============================================================
// FinancialReportShell — Reusable print layout wrapper
// Bismillah header, institution info, title, date, divider,
// content slot, and print-optimized CSS
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import BismillahHeader from '@/components/islamic/bismillah-header';
import GeometricDivider from '@/components/islamic/geometric-divider';

export interface FinancialReportShellProps {
  /** Report title (e.g., "Trial Balance") */
  title: string;
  /** Date range or as-of date string */
  dateLabel: string;
  /** Content to render inside the report */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export default function FinancialReportShell({
  title,
  dateLabel,
  children,
  className,
}: FinancialReportShellProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden print:border-stone-300',
        className
      )}
    >
      {/* Emerald top border accent */}
      <div className="h-[3px] bg-emerald-600" />

      <div className="p-6 print:p-4">
        {/* Bismillah */}
        <div className="flex justify-center mb-4">
          <BismillahHeader size="sm" />
        </div>

        {/* Institution info */}
        <div className="text-center mb-2">
          <h2 className="text-lg font-bold text-foreground print:text-black">
            Al-Huda Islamic Academy
          </h2>
          <p className="text-xs text-muted-foreground print:text-stone-600">
            Village: Char Kazirhat, Post: Daudkandi, District: Cumilla
          </p>
        </div>

        {/* Report title */}
        <h3 className="text-center text-base font-semibold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 mt-3 mb-1">
          {title}
        </h3>

        {/* Date */}
        <p className="text-center text-xs text-muted-foreground print:text-stone-500">
          {dateLabel}
        </p>

        {/* Divider */}
        <GeometricDivider color="primary" className="my-4 max-w-full" />

        {/* Content */}
        <div className="print:text-black">{children}</div>

        {/* Footer */}
        <GeometricDivider color="muted" className="my-4 max-w-full" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground print:text-stone-400">
          <span>Generated on {today}</span>
          <span>Al-Huda Islamic Academy — {title}</span>
        </div>
      </div>
    </div>
  );
}
