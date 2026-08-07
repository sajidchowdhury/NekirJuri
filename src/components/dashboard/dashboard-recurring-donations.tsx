'use client';

// ============================================================
// DashboardRecurringDonations — Widget for main dashboard
// Shows upcoming recurring donations due in next 30 days
// CR-5: Recurring donations with reminders
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  RefreshCw, CalendarClock, ArrowRight, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface RecurringDonation {
  id: number;
  receiptNo: string;
  amount: number;
  recurringAmount?: number | null;
  recurringFrequency?: string | null;
  nextDueDate?: string | null;
  donor?: { name: string } | null;
  donationCategory?: { name: string } | null;
}

export default function DashboardRecurringDonations() {
  const {
    data: donations,
    isLoading,
  } = useQuery<RecurringDonation[]>({
    queryKey: ['recurring-donations-upcoming'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/donations?isRecurring=true&upcomingDays=30&limit=5');
        if (!res.ok) return [];
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data || []);
        return items;
      } catch {
        return [];
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const upcomingDonations = donations || [];

  return (
    <Card className="border-t-[3px] border-t-amber-500 dark:border-t-amber-400">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-amber-500" />
            Upcoming Recurring Donations
          </CardTitle>
          <span className="text-xs text-muted-foreground">Next 30 days</span>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : upcomingDonations.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground space-y-2">
            <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground/30" />
            <p>No upcoming recurring donations</p>
            <p className="text-xs">Recurring donations with upcoming due dates will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcomingDonations.map((d, idx) => {
              const dueDate = d.nextDueDate ? new Date(d.nextDueDate) : null;
              const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
              const isUrgent = daysUntilDue !== null && daysUntilDue <= 3;
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.06 }}
                  className="flex items-center gap-3 px-1 py-3"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isOverdue ? 'bg-rose-100 dark:bg-rose-900/30'
                    : isUrgent ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-emerald-100 dark:bg-emerald-900/30'
                  }`}>
                    <RefreshCw className={`h-4 w-4 ${
                      isOverdue ? 'text-rose-600 dark:text-rose-400'
                      : isUrgent ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.donor?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      ৳{Number(d.recurringAmount || d.amount).toLocaleString('en-IN')}/{d.recurringFrequency === 'monthly' ? 'mo' : 'yr'}
                      {d.donationCategory?.name && <> &bull; {d.donationCategory.name}</>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge className={`text-[10px] border-0 ${
                      isOverdue ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      : isUrgent ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {isOverdue ? 'Overdue!' : `${daysUntilDue}d left`}
                    </Badge>
                    {dueDate && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {dueDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pt-2 border-t border-border">
          <Link href="/finance/donations">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
              View All Donations
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
