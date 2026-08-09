'use client';

// ============================================================
// Classes Page — Class manager with card grid and sections
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/atoms/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ClassForm from '@/components/academic/class-form';
import SectionForm from '@/components/academic/section-form';
import { slideUp, transitions, staggerChildren } from '@/lib/animations';
import { Plus, Users, BookOpen, ChevronDown, ChevronUp, School, AlertCircle, RefreshCw } from 'lucide-react';
import { apiDelete } from '@/lib/api-client';

// ── Types ────────────────────────────────────────────────

interface Section {
  id: number;
  name: string;
  studentCount: number;
}

interface ClassItem {
  id: number;
  name: string;
  code: string;
  sections: Section[];
  studentCount: number;
  teacherName?: string;
  capacity?: number;
}

interface LookupItem {
  id: number;
  name: string;
}

// ── Page ─────────────────────────────────────────────────

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [classFormOpen, setClassFormOpen] = React.useState(false);
  const [sectionFormOpen, setSectionFormOpen] = React.useState(false);
  const [expandedClass, setExpandedClass] = React.useState<number | null>(null);

  // ── Fetch classes with sections ─────────────────────────
  const {
    data: classesResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100');
      if (!res.ok) throw new Error('Failed to fetch classes');
      return res.json();
    },
  });

  // Transform API data to ClassItem shape
  const classes: ClassItem[] = React.useMemo(() => {
    const raw = classesResponse?.data || [];
    return raw.map((c: Record<string, unknown>) => ({
      id: c.id as number,
      name: (c.name as string) || '',
      code: (c.code as string) || '',
      sections: Array.isArray(c.sections)
        ? c.sections.map((s: Record<string, unknown>) => ({
            id: s.id as number,
            name: (s.name as string) || '',
            studentCount: (s._count as Record<string, number>)?.students ?? 0,
          }))
        : [],
      studentCount: (c._count as Record<string, number>)?.students ?? 0,
      teacherName: (c.classTeacher as Record<string, string>)?.name || undefined,
      capacity: (c.capacity as number) || undefined,
    }));
  }, [classesResponse]);

  // ── Fetch teachers for forms ────────────────────────────
  const { data: teachersResponse } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: async () => {
      const res = await fetch('/api/teachers?limit=100');
      if (!res.ok) throw new Error('Failed to fetch teachers');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
  const teachers: LookupItem[] = (teachersResponse?.data || []).map((t: Record<string, unknown>) => ({
    id: t.id as number,
    name: (t.name as string) || '',
  }));

  // ── Fetch sessions for forms ────────────────────────────
  const { data: sessionsResponse } = useQuery({
    queryKey: ['sessions-list'],
    queryFn: async () => {
      const res = await fetch('/api/academic-sessions?limit=50');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
  const sessions: LookupItem[] = (sessionsResponse?.data || []).map((s: Record<string, unknown>) => ({
    id: s.id as number,
    name: (s.name as string) || '',
  }));

  // ── Delete class mutation ───────────────────────────────
  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/classes/${id}`),
    onSuccess: () => {
      toast.success('Class deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete class');
    },
  });

  // ── Delete section mutation ─────────────────────────────
  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/api/sections/${id}`),
    onSuccess: () => {
      toast.success('Section deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['sections-list'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete section');
    },
  });

  const handleFormSuccess = () => {
    setClassFormOpen(false);
    setSectionFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['classes'] });
    queryClient.invalidateQueries({ queryKey: ['sections-list'] });
  };

  const toggleExpand = (id: number) => {
    setExpandedClass(expandedClass === id ? null : id);
  };

  // Error state
  if (isError) {
    return (
      <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="flex flex-col gap-6">
        <PageHeader title="Classes & Sections" description="Manage classes, sections, and class assignments" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load classes</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching class data. Please try again.</p>
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
        title="Classes & Sections"
        description="Manage classes, sections, and class assignments"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => setSectionFormOpen(true)} variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Section
            </Button>
            <Button onClick={() => setClassFormOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
              <Plus className="h-4 w-4" /> Add Class
            </Button>
          </div>
        }
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded mt-1" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-4 w-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && classes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <School className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No classes yet</h3>
          <p className="text-sm text-muted-foreground">Create your first class to get started.</p>
        </div>
      )}

      {/* Class cards grid */}
      {!isLoading && classes.length > 0 && (
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {classes.map((cls) => (
            <motion.div
              key={cls.id}
              variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.25 }}
            >
              <Card className="border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">Code: {cls.code}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{cls.sections.length} section{cls.sections.length !== 1 ? 's' : ''}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{cls.studentCount} students</span>
                    </div>
                    {cls.capacity && (
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Cap: {cls.capacity}</span>
                      </div>
                    )}
                  </div>
                  {cls.teacherName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Teacher: <span className="font-medium text-foreground">{cls.teacherName}</span>
                    </p>
                  )}

                  {/* Expand button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-xs gap-1"
                    onClick={() => toggleExpand(cls.id)}
                  >
                    {expandedClass === cls.id ? (
                      <>Hide Sections <ChevronUp className="h-3.5 w-3.5" /></>
                    ) : (
                      <>Show Sections <ChevronDown className="h-3.5 w-3.5" /></>
                    )}
                  </Button>

                  {/* Expanded sections */}
                  <AnimatePresence>
                    {expandedClass === cls.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Separator className="my-2" />
                        <div className="flex flex-col gap-1.5">
                          {cls.sections.map((sec) => (
                            <div
                              key={sec.id}
                              className="flex items-center justify-between rounded-md px-3 py-1.5 bg-muted/50 text-sm"
                            >
                              <span className="font-medium">Section {sec.name}</span>
                              <Badge variant="outline" className="text-xs">{sec.studentCount} students</Badge>
                            </div>
                          ))}
                          {cls.sections.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">No sections assigned</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Class form dialog */}
      <Dialog open={classFormOpen} onOpenChange={setClassFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <School className="h-5 w-5 text-emerald-600" />
              Add New Class
            </DialogTitle>
          </DialogHeader>
          <ClassForm
            teachers={teachers}
            sessions={sessions}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Section form dialog */}
      <Dialog open={sectionFormOpen} onOpenChange={setSectionFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              Add New Section
            </DialogTitle>
          </DialogHeader>
          <SectionForm
            classes={classes.map((c) => ({ id: c.id, name: c.name }))}
            teachers={teachers}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
