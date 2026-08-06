'use client';

// ============================================================
// Classes Page — Class manager with card grid and sections
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Plus, Users, BookOpen, ChevronDown, ChevronUp, School } from 'lucide-react';

// ── Sample data ──────────────────────────────────────────

const sampleClasses = [
  { id: 1, name: 'Class 1', code: 'C1', sections: [{ id: 1, name: 'A', studentCount: 42 }, { id: 2, name: 'B', studentCount: 43 }], studentCount: 85, teacherName: 'Ms. Rabeya Khatun', capacity: 90 },
  { id: 2, name: 'Class 5', code: 'C5', sections: [{ id: 3, name: 'A', studentCount: 40 }, { id: 4, name: 'B', studentCount: 40 }, { id: 5, name: 'C', studentCount: 40 }], studentCount: 120, teacherName: 'Maulana Ahmad Ali', capacity: 130 },
  { id: 3, name: 'Class 8', code: 'C8', sections: [{ id: 6, name: 'A', studentCount: 48 }, { id: 7, name: 'B', studentCount: 47 }], studentCount: 95, teacherName: 'Hafiz Mohammad Yunus', capacity: 100 },
  { id: 4, name: 'Hifz', code: 'HF', sections: [{ id: 8, name: 'A', studentCount: 40 }], studentCount: 40, teacherName: 'Hafiz Mohammad Yunus', capacity: 50 },
  { id: 5, name: 'Class 10', code: 'C10', sections: [{ id: 9, name: 'A', studentCount: 35 }, { id: 10, name: 'B', studentCount: 35 }], studentCount: 70, teacherName: 'Maulana Ishaq Siddiqui', capacity: 80 },
  { id: 6, name: 'Class 6', code: 'C6', sections: [{ id: 11, name: 'A', studentCount: 30 }], studentCount: 30, teacherName: 'Ms. Nasreen Jahan', capacity: 40 },
];

const sampleTeachers = [
  { id: 1, name: 'Maulana Ahmad Ali' },
  { id: 2, name: 'Hafiz Mohammad Yunus' },
  { id: 3, name: 'Ms. Rabeya Khatun' },
  { id: 4, name: 'Maulana Ishaq Siddiqui' },
  { id: 5, name: 'Ms. Nasreen Jahan' },
];

const sampleSessions = [
  { id: 1, name: '2025-2026' },
];

type ClassItem = typeof sampleClasses[number];

export default function ClassesPage() {
  const [classFormOpen, setClassFormOpen] = React.useState(false);
  const [sectionFormOpen, setSectionFormOpen] = React.useState(false);
  const [expandedClass, setExpandedClass] = React.useState<number | null>(null);

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/classes');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        return json.data?.length ? json.data : null;
      } catch { return null; }
    },
  });

  const classes: ClassItem[] = classesData || sampleClasses;

  const toggleExpand = (id: number) => {
    setExpandedClass(expandedClass === id ? null : id);
  };

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
        showBismillah
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

      {/* Class cards grid */}
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
                  <Badge variant="secondary" className="text-xs">{cls.sections.length} section{cls.sections.length > 1 ? 's' : ''}</Badge>
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

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
            teachers={sampleTeachers}
            sessions={sampleSessions}
            onSuccess={() => setClassFormOpen(false)}
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
            classes={sampleClasses.map((c) => ({ id: c.id, name: c.name }))}
            teachers={sampleTeachers}
            onSuccess={() => setSectionFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
