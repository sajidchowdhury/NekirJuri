'use client';

// ============================================================
// Sessions Page — Timeline/vertical list of academic sessions
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PageHeader from '@/components/atoms/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/atoms/status-badge';
import SessionForm from '@/components/academic/session-form';
import { cn } from '@/lib/utils';
import { slideUp, transitions, staggerChildren } from '@/lib/animations';
import { Plus, Calendar, CheckCircle2, Users } from 'lucide-react';

// ── Sample data ──────────────────────────────────────────

const sampleSessions = [
  { id: 1, name: '2024-2025', startDate: '2024-01-01', endDate: '2024-12-31', status: 'completed', isCurrent: false, studentCount: 420, classCount: 6 },
  { id: 2, name: '2025-2026', startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', isCurrent: true, studentCount: 440, classCount: 7 },
  { id: 3, name: '2026-2027', startDate: '2026-01-01', endDate: '2026-12-31', status: 'upcoming', isCurrent: false, studentCount: 0, classCount: 0 },
];

type Session = typeof sampleSessions[number];

export default function SessionsPage() {
  const [formOpen, setFormOpen] = React.useState(false);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['academic-sessions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/academic-sessions');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        return json.data?.length ? json.data : null;
      } catch { return null; }
    },
  });

  const sessions: Session[] = sessionsData || sampleSessions;

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Academic Sessions"
        description="Manage academic sessions, terms, and yearly schedules"
        showBismillah
        actions={
          <Button onClick={() => setFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
            <Plus className="h-4 w-4" /> Add Session
          </Button>
        }
      />

      {/* Timeline view */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden sm:block" />

        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4"
        >
          {sessions.map((session, idx) => (
            <motion.div
              key={session.id}
              variants={{ initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } }}
              transition={{ duration: 0.25, delay: idx * 0.1 }}
            >
              <Card className={cn(
                'relative overflow-hidden',
                session.isCurrent && 'ring-2 ring-emerald-600',
              )}>
                {/* Emerald left accent for current session */}
                {session.isCurrent && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                )}
                <CardContent className="p-4 sm:pl-14">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Timeline dot (desktop) */}
                    <div className="absolute left-4 top-4 hidden sm:flex">
                      <div className={cn(
                        'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                        session.isCurrent ? 'border-emerald-600 bg-emerald-600' : 'border-border bg-background',
                      )}>
                        {session.isCurrent && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        {session.isCurrent && (
                          <Badge className="bg-emerald-600 text-white text-xs">Current</Badge>
                        )}
                        <StatusBadge status={session.status as 'active' | 'completed' | 'pending'} />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {format(new Date(session.startDate), 'MMM d, yyyy')} → {format(new Date(session.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{session.studentCount}</span>
                        <span className="text-muted-foreground">students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{session.classCount}</span>
                        <span className="text-muted-foreground">classes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Session form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Add Academic Session
            </DialogTitle>
          </DialogHeader>
          <SessionForm onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}


