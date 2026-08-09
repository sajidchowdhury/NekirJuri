'use client';

// ============================================================
// FeeStructureBuilder — Matrix view: Classes (rows) × Fee Categories (columns)
// Editable cells, academic session selector, color-coded amounts
// ============================================================

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, X, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type FeeStructureCell,
  type FeeCategory,
  type ClassGroup,
  type AcademicSession,
  formatTaka,
} from '@/lib/finance/sample-data';

interface FeeStructureBuilderProps {
  className?: string;
}

export default function FeeStructureBuilder({ className }: FeeStructureBuilderProps) {
  // Fetch fee structures from API
  const { data: feeStructuresResponse } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: async () => {
      const res = await fetch('/api/fee-structures?limit=100');
      if (!res.ok) throw new Error('Failed to fetch fee structures');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch fee categories from API
  const { data: feeCategoriesResponse } = useQuery({
    queryKey: ['fee-categories'],
    queryFn: async () => {
      const res = await fetch('/api/fee-categories?limit=50');
      if (!res.ok) throw new Error('Failed to fetch fee categories');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch classes from API
  const { data: classesResponse } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await fetch('/api/classes?limit=100');
      if (!res.ok) throw new Error('Failed to fetch classes');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch sessions from API
  const { data: sessionsResponse } = useQuery({
    queryKey: ['academic-sessions'],
    queryFn: async () => {
      const res = await fetch('/api/academic-sessions?limit=50');
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const initialFeeStructure: FeeStructureCell[] = feeStructuresResponse?.data || [];
  const feeCategories: FeeCategory[] = feeCategoriesResponse?.data || [];
  const classesData: ClassGroup[] = classesResponse?.data || [];
  const sessions: AcademicSession[] = sessionsResponse?.data || [];

  const [session, setSession] = React.useState('');
  const [structure, setStructure] = React.useState<FeeStructureCell[]>([]);
  const [editingCell, setEditingCell] = React.useState<string | null>(null); // "classId-categoryId"
  const [editValue, setEditValue] = React.useState<string>('');

  // Sync structure when API data arrives
  React.useEffect(() => {
    setStructure(initialFeeStructure);
  }, [initialFeeStructure]);

  const categories = feeCategories;
  const classes = classesData.filter(c =>
    structure.some(s => s.classId === c.id)
  );

  const getCellKey = (classId: string, categoryId: string) => `${classId}-${categoryId}`;

  const getCell = (classId: string, categoryId: string): FeeStructureCell | undefined => {
    return structure.find(s => s.classId === classId && s.categoryId === categoryId);
  };

  const startEdit = (classId: string, categoryId: string) => {
    const cell = getCell(classId, categoryId);
    setEditingCell(getCellKey(classId, categoryId));
    setEditValue(cell ? cell.amount.toString() : '0');
  };

  const saveEdit = (classId: string, categoryId: string) => {
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) {
      setStructure(prev => {
        const exists = prev.find(s => s.classId === classId && s.categoryId === categoryId);
        if (exists) {
          return prev.map(s =>
            s.classId === classId && s.categoryId === categoryId
              ? { ...s, amount: val, isSet: val > 0 }
              : s
          );
        }
        return [...prev, {
          classId,
          className: classes.find(c => c.id === classId)?.name || classId,
          categoryId,
          amount: val,
          isSet: val > 0,
        }];
      });
    }
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const getCellColor = (cell: FeeStructureCell | undefined) => {
    if (!cell || !cell.isSet) return 'bg-stone-50 dark:bg-stone-900/20 text-stone-400';
    if (cell.amount > 0) return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
    return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={className}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">Fee Structure Matrix</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.isCurrent && ' (Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {classes.length} Classes
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Legend */}
          <div className="flex items-center gap-4 px-4 pb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800" />
              <span className="text-muted-foreground">Set Amount</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" />
              <span className="text-muted-foreground">Default</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-700" />
              <span className="text-muted-foreground">Not Applicable</span>
            </div>
          </div>

          {/* Matrix table — horizontal scroll on mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/50">
                  <th className="sticky left-0 bg-muted/50 px-3 py-2.5 text-left font-medium text-muted-foreground min-w-[100px] z-10">
                    Class
                  </th>
                  {categories.map(cat => (
                    <th key={cat.id} className="px-3 py-2.5 text-center font-medium text-muted-foreground min-w-[90px]">
                      <span className="block truncate text-xs">{cat.nameEn}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map(cls => (
                  <tr key={cls.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 bg-card px-3 py-2 font-medium z-10 border-r border-border">
                      {cls.nameBn}
                    </td>
                    {categories.map(cat => {
                      const cell = getCell(cls.id, cat.id);
                      const cellKey = getCellKey(cls.id, cat.id);
                      const isEditing = editingCell === cellKey;

                      return (
                        <td
                          key={cat.id}
                          className={`px-2 py-2 text-center ${getCellColor(cell)}`}
                        >
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="h-7 w-16 text-xs text-center"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(cls.id, cat.id);
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => saveEdit(cls.id, cat.id)}>
                                <Check className="h-3 w-3 text-emerald-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={cancelEdit}>
                                <X className="h-3 w-3 text-rose-500" />
                              </Button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(cls.id, cat.id)}
                              className="group/cell relative inline-flex items-center gap-1 hover:bg-muted/50 rounded px-2 py-1 transition-colors cursor-pointer"
                            >
                              <span className="font-semibold text-xs">
                                {cell && cell.isSet ? formatTaka(cell.amount) : '—'}
                              </span>
                              <Pencil className="h-2.5 w-2.5 opacity-0 group-hover/cell:opacity-100 transition-opacity text-muted-foreground" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
