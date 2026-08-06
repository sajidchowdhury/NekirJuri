'use client';

// ============================================================
// UpcomingEvents — Card list of upcoming events/alerts
// Types: due fees, pending salary, low stock alerts
// ============================================================

import { motion } from 'framer-motion';
import { Calendar, AlertTriangle, Bell, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/** Event item shape */
export interface UpcomingEvent {
  /** Event title */
  title: string;
  /** Due date */
  dueDate: string | Date;
  /** Event type determines icon and urgency */
  type: 'due_fees' | 'pending_salary' | 'low_stock' | 'reminder' | 'general';
  /** Urgency level */
  urgency: 'urgent' | 'warning' | 'normal';
}

export interface UpcomingEventsProps {
  /** List of upcoming events */
  events?: UpcomingEvent[];
  /** Loading state */
  loading?: boolean;
}

/** Urgency badge styles */
const urgencyStyles: Record<string, string> = {
  urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  normal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
};

/** Type icon mapping */
const typeIcons: Record<string, React.ElementType> = {
  due_fees: DollarSign,
  pending_salary: DollarSign,
  low_stock: Package,
  reminder: Bell,
  general: Calendar,
};

/** Sample events for empty/preview state */
const sampleEvents: UpcomingEvent[] = [
  {
    title: '15 students have fees due tomorrow',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'due_fees',
    urgency: 'urgent',
  },
  {
    title: 'Teacher salaries pending for this month',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'pending_salary',
    urgency: 'warning',
  },
  {
    title: 'Stationery stock running low',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'low_stock',
    urgency: 'warning',
  },
  {
    title: 'Parent-teacher meeting scheduled',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'reminder',
    urgency: 'normal',
  },
];

/**
 * UpcomingEvents displays a list of upcoming events and alerts
 * with urgency-based badges and type-based icons.
 */
export default function UpcomingEvents({
  events,
  loading = false,
}: UpcomingEventsProps) {
  const items = events && events.length > 0 ? events : sampleEvents;

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-2 w-1/3 bg-muted animate-pulse rounded" />
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
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1], delay: 0.25 }}
    >
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((event, index) => {
                const Icon = typeIcons[event.type] || Calendar;
                const urgencyClass = urgencyStyles[event.urgency];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3 rounded-lg p-3 border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/80">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-foreground leading-snug">
                          {event.title}
                        </p>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] px-1.5 py-0 ${urgencyClass}`}
                        >
                          {event.urgency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <p className="text-[11px] text-muted-foreground">
                          {format(new Date(event.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
