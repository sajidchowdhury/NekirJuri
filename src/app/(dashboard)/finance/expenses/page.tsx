'use client';

// ============================================================
// Expenses Page — Full expense management with dashboard, list, form
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import ExpenseDashboard from '@/components/finance/expense-dashboard';
import ExpenseList from '@/components/finance/expense-list';
import ExpenseForm from '@/components/finance/expense-form';
import { slideUp, transitions } from '@/lib/animations';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<Record<string, unknown> | null>(null);

  // Fetch expenses for the page
  const {
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('/api/expenses?limit=100');
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to delete expense');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const handleExportCSV = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleDelete = (expense: Record<string, unknown>) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(expense.id as number);
    }
  };

  const handleFormSuccess = () => {
    setShowAddDialog(false);
    setEditingExpense(null);
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  // Error state
  if (isError) {
    return (
      <motion.div initial={slideUp.initial} animate={slideUp.animate} transition={transitions.normal} className="space-y-6">
        <PageHeader title="Expense Management" description="Track and categorize institutional expenses, monitor budgets" />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h3 className="text-lg font-semibold">Failed to load expenses</h3>
          <p className="text-sm text-muted-foreground max-w-md">There was an error fetching expense data. Please try again.</p>
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
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Expense Management"
        description="Track and categorize institutional expenses, monitor budgets"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </div>
        }
      />

      {/* Dashboard Stats + Charts */}
      <ExpenseDashboard />

      {/* Expense List */}
      <ExpenseList
        onEdit={(expense) => {
          setEditingExpense(expense as Record<string, unknown>);
          setShowAddDialog(true);
        }}
        onDelete={handleDelete}
      />

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) setEditingExpense(null);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'Record New Expense'}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? 'Update expense information'
                : 'Enter expense details to record a new transaction'}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            onSuccess={handleFormSuccess}
            editDefaults={
              editingExpense
                ? {
                    category: (editingExpense.category as string) || (editingExpense.expenseCategory as Record<string, string>)?.name || 'utilities',
                    amount: Number(editingExpense.amount || 0),
                    date: (editingExpense.expenseDate as string) || (editingExpense.date as string) || '',
                    description: (editingExpense.description as string) || '',
                    method: (editingExpense.paymentMethod as string) || (editingExpense.method as string) || 'cash',
                    receiptRef: (editingExpense.receiptRef as string) || '',
                    note: (editingExpense.note as string) || '',
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
