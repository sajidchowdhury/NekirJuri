'use client';

// ============================================================
// PageHeader — Consistent page header component
// Renders title, description, actions, and breadcrumb
// CR-1: Bismillah removed from page headers (now in top bar only)
// Print layouts still use BismillahHeader directly
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';

/** Props for PageHeader component */
export interface PageHeaderProps {
  /** Page title (rendered as h1) */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action buttons/elements (right-aligned on desktop) */
  actions?: React.ReactNode;
  /** Optional breadcrumb slot above the title */
  breadcrumb?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader provides a consistent page header layout with:
 * - Optional breadcrumb
 * - Title (h1) and description
 * - Action slot (right-aligned on desktop, below title on mobile)
 */
export default function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Optional Breadcrumb */}
      {breadcrumb && (
        <div className="flex items-center">
          {breadcrumb}
        </div>
      )}

      {/* Title row — stacks on mobile, side-by-side on desktop */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
