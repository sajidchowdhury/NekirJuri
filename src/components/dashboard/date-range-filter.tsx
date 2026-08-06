'use client';

// ============================================================
// DateRangeFilter — Date range selector for dashboard filtering
// Options: This Month, This Quarter, This Session, Custom
// ============================================================

import { CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Date range option */
export type DateRangeOption = 'this_month' | 'this_quarter' | 'this_session' | 'custom';

/** Date range filter callback data */
export interface DateRange {
  option: DateRangeOption;
  startDate?: Date;
  endDate?: Date;
}

export interface DateRangeFilterProps {
  /** Currently selected range */
  value?: DateRangeOption;
  /** Callback when range changes */
  onChange?: (range: DateRange) => void;
  /** Additional CSS class */
  className?: string;
}

/** Display labels for options */
const optionLabels: Record<DateRangeOption, string> = {
  this_month: 'This Month',
  this_quarter: 'This Quarter',
  this_session: 'This Session',
  custom: 'Custom',
};

/**
 * DateRangeFilter provides a compact dropdown for selecting
 * dashboard date range: month, quarter, session, or custom.
 */
export default function DateRangeFilter({
  value = 'this_month',
  onChange,
  className,
}: DateRangeFilterProps) {
  function handleChange(option: string) {
    const rangeOption = option as DateRangeOption;
    onChange?.({ option: rangeOption });
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger size="sm" className="w-[140px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(optionLabels).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
