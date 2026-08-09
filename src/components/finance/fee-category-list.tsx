'use client';

// ============================================================
// FeeCategoryList — Card grid of fee categories
// Shows icon, name (Bn+En), amount, frequency badge, student count
// Edit dialog (FeeCategoryForm) + Delete confirmation (AlertDialog)
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  GraduationCap, BookOpen, FileText, Bus, Home, Library, Monitor, Trophy,
  type LucideIcon, Plus, Pencil, Check, X, Trash2, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import FeeCategoryForm from '@/components/finance/fee-category-form';
import { apiDelete } from '@/lib/api-client';
import {
  type FeeCategory,
  type FeeFrequency,
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
  const queryClient = useQueryClient();

  // Fetch fee categories from API
  const { data: categories = [], isLoading } = useQuery<FeeCategory[]>({
    queryKey: ['fee-categories'],
    queryFn: async () => {
      const res = await fetch('/api/fee-categories?limit=100');
      if (!res.ok) throw new Error('Failed to fetch fee categories');
      const json = await res.json();
      return json.data ?? json;
    },
  });

  // Local editing state (inline amount edit)
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editAmount, setEditAmount] = React.useState<string>('');

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editCategory, setEditCategory] = React.useState<FeeCategory | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteCategory, setDeleteCategory] = React.useState<FeeCategory | null>(null);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/fee-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-categories'] });
      toast.success('Fee category deleted');
      setDeleteDialogOpen(false);
      setDeleteCategory(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete fee category');
    },
  });

  // Local inline amount edit (no API call — local only as per spec)
  const [localCategories, setLocalCategories] = React.useState<FeeCategory[]>([]);

  // Merge API data with local edits
  const displayCategories = React.useMemo(() => {
    if (localCategories.length > 0) return localCategories;
    return categories;
  }, [categories, localCategories]);

  // When categories from API change, reset local
  React.useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const startEdit = (cat: FeeCategory) => {
    setEditingId(cat.id);
    setEditAmount(cat.amount.toString());
  };

  const saveEdit = (id: string) => {
    const val = parseInt(editAmount, 10);
    if (!isNaN(val) && val >= 0) {
      setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, amount: val } : c));
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Open full edit dialog
  const openEditDialog = (cat: FeeCategory) => {
    setEditCategory(cat);
    setEditDialogOpen(true);
  };

  // Open delete confirmation
  const openDeleteDialog = (cat: FeeCategory) => {
    setDeleteCategory(cat);
    setDeleteDialogOpen(true);
  };

  // Handle delete
  const handleDelete = () => {
    if (!deleteCategory) return;
    deleteMutation.mutate(deleteCategory.id);
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-muted-foreground">Loading fee categories...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {displayCategories.length} fee categories configured
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
            {displayCategories.map((cat, idx) => {
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
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditDialog(cat)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-600"
                              onClick={() => openDeleteDialog(cat)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
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
        </>
      )}

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fee Category</DialogTitle>
            <DialogDescription>
              Update fee category details
            </DialogDescription>
          </DialogHeader>
          {editCategory && (
            <FeeCategoryForm
              defaultValues={{
                id: Number(editCategory.id),
                name: editCategory.nameEn,
                nameBn: editCategory.nameBn,
                code: editCategory.nameEn.replace(/\s+/g, '_').toUpperCase().slice(0, 10),
                amount: editCategory.amount.toString(),
                frequency: editCategory.frequency,
                isRecurring: editCategory.isRecurring,
              }}
              onSuccess={() => {
                setEditDialogOpen(false);
                setEditCategory(null);
                queryClient.invalidateQueries({ queryKey: ['fee-categories'] });
                toast.success('Fee category updated');
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteCategory?.nameBn || deleteCategory?.nameEn}</strong>?
              This action will deactivate the category. Existing invoices and fee structures referencing this category will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
