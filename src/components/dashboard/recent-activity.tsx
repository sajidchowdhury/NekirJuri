'use client';

// ============================================================
// RecentActivity — Timeline list of recent activities
// Each item: icon, description, relative timestamp
// CR-2: Multi-Language System — All strings use useTranslations
// ============================================================

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  UserPlus,
  CreditCard,
  FileText,
  AlertCircle,
  CheckCircle2,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale/ar';
import { bn } from 'date-fns/locale/bn';
import { useLocale } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/** Activity item shape */
export interface ActivityItem {
  /** Unique ID */
  id?: number;
  /** Action type determines icon */
  action?: string;
  /** Human-readable description */
  description?: string;
  /** When the activity occurred */
  createdAt?: string | Date;
  /** Entity type for icon resolution */
  entityType?: string;
}

export interface RecentActivityProps {
  /** List of recent activities */
  activities?: ActivityItem[];
  /** Loading state */
  loading?: boolean;
}

/** Map action/entity types to icons and colors */
const iconMap: Record<string, { icon: LucideIcon; color: string }> = {
  student: { icon: UserPlus, color: 'text-emerald-500' },
  fee: { icon: CreditCard, color: 'text-amber-500' },
  payment: { icon: CreditCard, color: 'text-emerald-500' },
  invoice: { icon: FileText, color: 'text-sky-500' },
  alert: { icon: AlertCircle, color: 'text-rose-500' },
  settings: { icon: Settings, color: 'text-stone-500' },
  approve: { icon: CheckCircle2, color: 'text-emerald-500' },
  default: { icon: FileText, color: 'text-stone-400' },
};

/** Resolve icon + color from activity */
function resolveIcon(activity: ActivityItem) {
  const key = activity.action?.toLowerCase() || activity.entityType?.toLowerCase() || 'default';
  return iconMap[key] || iconMap.default;
}

/**
 * RecentActivity displays a timeline of recent activities
 * with icons, descriptions, and relative timestamps.
 */
export default function RecentActivity({
  activities,
  loading = false,
}: RecentActivityProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const items = activities || [];

  // Select date-fns locale for relative time formatting
  const dateLocale = locale === 'ar' ? ar : locale === 'bn' ? bn : undefined;

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-2 w-1/4 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
    >
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex items-center justify-center min-h-[120px]">
              <p className="text-sm text-muted-foreground">No data available yet</p>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <div className="flex flex-col gap-1">
                  {items.slice(0, 10).map((activity, index) => {
                    const { icon: Icon, color } = resolveIcon(activity);
                    const timeAgo = activity.createdAt
                      ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, ...(dateLocale ? { locale: dateLocale } : {}) })
                      : '';

                    return (
                      <motion.div
                        key={activity.id ?? index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                      >
                        {/* Icon */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/80">
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug truncate">
                            {activity.description || t('activityRecorded')}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {timeAgo}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* View All link */}
              <div className="mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                  {t('viewAllActivity')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
