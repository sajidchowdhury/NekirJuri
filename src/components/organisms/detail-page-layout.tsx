'use client';

// ============================================================
// DetailPageLayout — Tabbed detail page with profile header
// ============================================================

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export interface ProfileHeader {
  /** Avatar image URL */
  imageUrl?: string;
  /** Name for initials fallback */
  name: string;
  /** Subtitle line */
  subtitle?: string;
  /** Badge items */
  badges?: Array<{ label: string; variant?: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }>;
  /** Additional info items */
  infoItems?: Array<{ label: string; value: string }>;
}

export interface DetailTab {
  label: string;
  value: string;
  content: React.ReactNode;
}

export interface DetailPageLayoutProps {
  profileHeader: ProfileHeader;
  tabs: DetailTab[];
  /** Default active tab value */
  defaultTab?: string;
  /** Additional class */
  className?: string;
}

export default function DetailPageLayout({
  profileHeader,
  tabs,
  defaultTab,
  className,
}: DetailPageLayoutProps) {
  const initials = profileHeader.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-xl border border-border bg-card">
        <Avatar className="h-16 w-16 shrink-0">
          <AvatarImage src={profileHeader.imageUrl} alt={profileHeader.name} />
          <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{profileHeader.name}</h2>
            {profileHeader.badges?.map((badge, idx) => (
              <Badge
                key={idx}
                variant={badge.variant || 'secondary'}
                className={cn('text-xs', badge.className)}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
          {profileHeader.subtitle && (
            <p className="text-sm text-muted-foreground">{profileHeader.subtitle}</p>
          )}
          {profileHeader.infoItems && profileHeader.infoItems.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
              {profileHeader.infoItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab || tabs[0]?.value} className="w-full">
        <TabsList className="w-full sm:w-auto bg-muted/50 p-1 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4 py-1.5 text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
