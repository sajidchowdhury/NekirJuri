'use client';

// ============================================================
// FeeCategoryList — Card grid of fee categories
// Shows icon, name (Bn+En), amount, frequency badge, student count
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, FileText, Bus, Home, Library, Monitor, Trophy,
  type LucideIcon, Plus, Pencil, Check, X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  type FeeCategory,
  type FeeFrequency,
  sampleFeeCategories,
  formatTaka,
} from '@/lib/finance/sample-data';

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, BookOpen, FileText, Bus, Home, Library, Monitor, Trophy,
};

const frequencyLabels: Record<FeeFrequency, string> = {
  monthly: 'মাসিক / Monthly',
  quarterly: 'ত্রৈমাসিক / Quarterly',
  annual: 'বার্ষিক / Annual',
  'one-time': 'এককালীন / One-time',
};

const frequencyColors: Record<FeeFrequency, string> = {
  monthly: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  quarterly: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  annual: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'one-time': 'bg-stone-100 text-stone-600 dark:bg-stone-800/30 dark:text-stone-400',
};

interface FeeCategoryListProps {
  onAddCategory?: () => void;
}

export default function FeeCategoryList({ onAddCategory }: FeeCategoryListProps) {
  const [categories, setCategories] = React.useState<FeeCategory[]>(sampleFeeCategories);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState<string>('');

  const startEdit = (cat: FeeCategory) => {
    setEditingId(cat.id);
    setEditAmount(cat.amount.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseInt(editAmount, 10);
    if (!isNaN(val) && val >= 0) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, amount: val } : c));
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} fee categories configured
        </p>
        <Button
          onClick={onAddCategory}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat, idx) => {
          const Icon = iconMap[cat.icon] || BookOpen;
          const isEditing = editingId === cat.id;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
            >
              <Card className="border-t-[3px] border-t-emerald-600 dark:border-t-emerald-400 hover:shadow-md transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{cat.nameBn}</p>
                        <p className="text-xs text-muted-foreground truncate">{cat.nameEn}</p>
                      </div>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={() => startEdit(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="mt-3 flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">৳</span>
                        <Input
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="h-7 w-24 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(cat.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => saveEdit(cat.id)}>
                          <Check className="h-3 w-3 text-emerald-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                          <X className="h-3 w-3 text-rose-500" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {formatTaka(cat.amount)}
                      </p>
                    )}
                  </div>

                  {/* Frequency + Student count */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${frequencyColors[cat.frequency]}`}>
                      {frequencyLabels[cat.frequency]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {cat.studentCount} students
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
