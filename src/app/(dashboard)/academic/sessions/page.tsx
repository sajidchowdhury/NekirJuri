'use client';

// ============================================================
// Sessions Page — Timeline/vertical list of academic sessions
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Plus, Calendar, CheckCircle2, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { apiDelete } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────

interface Session {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  isCurrent: boolean;
  studentCount: number;
  classCount: number;
}

// ── Page ─────────────────────────────────────────────────

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = React.useState(false);

  const {
    data: sessionsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['academic-sessions'],
    queryFn: async () => {
      const res = await fetch('/api/academic-sessions?limit=50');
      if (!res.ok) throw new Error('Failed to fetch academic sessions');
      return res.json();
    },
  });

  // Transform API data
  const sessions: Session[] = React.useMemo(() => {
    const raw = sessionsResponse?.data || [];
    return raw.map((s: Record<string, unknown>) => ({
      id: s.id as number,
      name: (s.name as string) || '',
      startDate: (s.startDate as string) || '',
      endDate: (s.endDate as string) || '',
      status: (s.status as string) || 'upcoming',
      isCurrent: (s.isCurrent as boolean) || false,
      studentCount: (s._count as Record<string, number>)?.students ?? 0,
      classCount: (s._count as Record<string, number>)?.classes ?? 0,
    }));
  }, [sessionsResponse]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/academic-sessions/${id}`),
    onSuccess: () => {
      toast.success('Session deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete session');
    },
  });

  const handleDelete = (session: Session) => {
    if (session.isCurrent) {
      toast.error('Cannot delete the current academic session');
      return;
    }
    if (confirm(`Are you sure you want to delete session "${session.name}"?`)) {
      deleteMutation.mutate(session.id);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['academic-sessions'] });
  };

  // Error state
  if (isError) {
    return (
      <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="flex flex-col gap-6">
        <PageHeader title="Academic Sessions" description="Manage academic sessions, terms, and yearly schedules" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load sessions</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching academic sessions. Please try again.</p>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </motion.div>
    );
  }

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
        actions={
          <Button onClick={() => setFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
            <Plus className="h-4 w-4" /> Add Session
          </Button>
        }
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No academic sessions yet</h3>
          <p className="text-sm text-muted-foreground">Create your first academic session to get started.</p>
        </div>
      )}

      {/* Timeline view */}
      {!isLoading && sessions.length > 0 && (
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
      )}

      {/* Session form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Add Academic Session
            </DialogTitle>
          </DialogHeader>
          <SessionForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
