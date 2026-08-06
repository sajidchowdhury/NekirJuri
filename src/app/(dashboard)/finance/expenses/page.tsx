'use client';

// ============================================================
// Expenses Page — Full expense management with dashboard, list, form
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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
import { slideUp } from '@/lib/animations';
import type { ExpenseRecord } from '@/lib/finance/sample-data';

export default function ExpensesPage() {
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseRecord | null>(null);

  const handleExportCSV = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

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
          setEditingExpense(expense);
          setShowAddDialog(true);
        }}
        onDelete={() => {
          // Could show confirmation
        }}
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
            onSuccess={() => {
              setShowAddDialog(false);
              setEditingExpense(null);
            }}
            editDefaults={
              editingExpense
                ? {
                    category: editingExpense.category,
                    amount: editingExpense.amount,
                    date: editingExpense.date,
                    description: editingExpense.description,
                    method: editingExpense.method,
                    receiptRef: editingExpense.receiptRef,
                    note: editingExpense.note,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
