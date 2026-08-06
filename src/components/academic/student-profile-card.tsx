'use client';

// ============================================================
// StudentProfileCard — Compact student card for table rows & mobile
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatusBadge from '@/components/atoms/status-badge';

export interface StudentProfileCardProps {
  name: string;
  nameBn?: string;
  photoUrl?: string;
  className?: string;
  section?: string;
  roll?: string;
  status?: string;
}

export default function StudentProfileCard({
  name,
  nameBn,
  photoUrl,
  className,
  section,
  roll,
  status = 'active',
}: StudentProfileCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={photoUrl} alt={name} />
        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">{name}</span>
          {nameBn && (
            <span className="text-xs text-muted-foreground font-bengali truncate hidden sm:inline">{nameBn}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {section && <span>Sec {section}</span>}
          {roll && <span>Roll {roll}</span>}
        </div>
      </div>
      <StatusBadge status={status as 'active' | 'inactive'} className="ml-auto shrink-0" />
    </div>
  );
}
