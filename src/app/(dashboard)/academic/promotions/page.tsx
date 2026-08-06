'use client';

// ============================================================
// Promotions Page — Student promotion wizard
// 4-step: Select Session → Source Class → Select Students → Destination
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PageHeader from '@/components/atoms/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import FormWizard from '@/components/organisms/form-wizard';
import { slideUp, transitions } from '@/lib/animations';
import { Search } from 'lucide-react';

// ── Sample data ──────────────────────────────────────────

const sampleSessions = [
  { id: 1, name: '2024-2025' },
  { id: 2, name: '2025-2026' },
  { id: 3, name: '2026-2027' },
];

const sampleClasses = [
  { id: 1, name: 'Class 1' },
  { id: 2, name: 'Class 5' },
  { id: 3, name: 'Class 8' },
  { id: 4, name: 'Hifz' },
  { id: 5, name: 'Class 10' },
  { id: 6, name: 'Class 6' },
];

const sampleSections = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' },
];

const sampleStudents = [
  { id: 1, name: 'Abdullah Rahim', roll: '01', className: 'Class 5', section: 'A' },
  { id: 2, name: 'Fatima Khatun', roll: '05', className: 'Class 5', section: 'B' },
  { id: 3, name: 'Mohammad Hasan', roll: '12', className: 'Class 5', section: 'A' },
  { id: 4, name: 'Aisha Begum', roll: '03', className: 'Class 5', section: 'A' },
  { id: 5, name: 'Ibrahim Khan', roll: '08', className: 'Class 5', section: 'C' },
  { id: 6, name: 'Zainab Akter', roll: '15', className: 'Class 5', section: 'B' },
];

export default function PromotionsPage() {
  // Wizard state
  const [targetSession, setTargetSession] = React.useState('');
  const [sourceClass, setSourceClass] = React.useState('');
  const [selectedStudents, setSelectedStudents] = React.useState<Set<number>>(new Set());
  const [destClass, setDestClass] = React.useState('');
  const [destSection, setDestSection] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isPromoting, setIsPromoting] = React.useState(false);

  const toggleStudent = (id: number) => {
    const next = new Set(selectedStudents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudents(next);
  };

  const toggleAll = () => {
    if (selectedStudents.size === sampleStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(sampleStudents.map((s) => s.id)));
    }
  };

  const filteredStudents = sampleStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roll.includes(searchQuery)
  );

  const handlePromote = async () => {
    setIsPromoting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    toast.success(`${selectedStudents.size} students promoted successfully!`);
    setIsPromoting(false);
    // Reset
    setTargetSession('');
    setSourceClass('');
    setSelectedStudents(new Set());
    setDestClass('');
    setDestSection('');
  };

  // Step 1: Select target session
  const step1 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select the academic session to promote students into.</p>
      <div className="flex flex-col gap-1.5">
        <Label>Target Academic Session *</Label>
        <Select value={targetSession} onValueChange={setTargetSession}>
          <SelectTrigger>
            <SelectValue placeholder="Select academic session" />
          </SelectTrigger>
          <SelectContent>
            {sampleSessions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Step 2: Select source class
  const step2 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select the class to promote students from.</p>
      <div className="flex flex-col gap-1.5">
        <Label>Source Class *</Label>
        <Select value={sourceClass} onValueChange={setSourceClass}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {sampleClasses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Step 3: Select students
  const step3 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select students to promote. Use the search to find specific students.</p>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={toggleAll}>
          {selectedStudents.size === sampleStudents.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <div className="border border-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
        {filteredStudents.map((student) => (
          <label
            key={student.id}
            className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <Checkbox
              checked={selectedStudents.has(student.id)}
              onCheckedChange={() => toggleStudent(student.id)}
            />
            <span className="text-sm font-medium flex-1">{student.name}</span>
            <Badge variant="outline" className="text-xs font-mono">Roll {student.roll}</Badge>
            <Badge variant="secondary" className="text-xs">Sec {student.section}</Badge>
          </label>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
      </p>
    </div>
  );

  // Step 4: Destination + confirm
  const step4 = (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Select the destination class and section for the promoted students.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Destination Class *</Label>
          <Select value={destClass} onValueChange={setDestClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {sampleClasses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Destination Section</Label>
          <Select value={destSection || '_none'} onValueChange={(v) => setDestSection(v === '_none' ? '' : v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {sampleSections.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Review summary */}
      <Card className="bg-muted/30 border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Promotion Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Session:</span>
              <span className="font-medium">{sampleSessions.find((s) => String(s.id) === targetSession)?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source Class:</span>
              <span className="font-medium">{sampleClasses.find((c) => String(c.id) === sourceClass)?.name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destination:</span>
              <span className="font-medium">
                {sampleClasses.find((c) => String(c.id) === destClass)?.name || '—'}
                {destSection && ` / ${sampleSections.find((s) => String(s.id) === destSection)?.name || ''}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Students:</span>
              <span className="font-medium text-emerald-600">{selectedStudents.size} selected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const steps = [
    { title: 'Session', component: step1, validate: () => !!targetSession },
    { title: 'Source Class', component: step2, validate: () => !!sourceClass },
    { title: 'Students', component: step3, validate: () => selectedStudents.size > 0 },
    { title: 'Destination', component: step4, validate: () => !!destClass },
  ];

  return (
    <motion.div
      initial={slideUp.initial}
      animate={slideUp.animate}
      transition={transitions.normal}
      className="flex flex-col gap-6"
    >
      <PageHeader
        title="Student Promotions"
        description="Promote students to the next class for a new academic session"

      />

      <Card>
        <CardContent className="p-6">
          <FormWizard
            steps={steps}
            onSubmit={handlePromote}
            isLoading={isPromoting}
            submitLabel="Confirm Promotion"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
