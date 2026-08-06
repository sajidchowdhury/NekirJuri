'use client';

// ============================================================
// Payroll Page — Full Payroll Management with tabs
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import PayrollDashboard from '@/components/payroll/payroll-dashboard';
import SalaryStructureList from '@/components/payroll/salary-structure-list';
import SalaryStructureForm from '@/components/payroll/salary-structure-form';
import PayrollProcessor from '@/components/payroll/payroll-processor';
import PayslipView from '@/components/payroll/payslip-view';
import SalaryPaymentList from '@/components/payroll/salary-payment-list';
import { slideUp } from '@/lib/animations';
import { salaryStructures } from '@/lib/payroll/sample-data';
import type { SalaryStructure, SalaryPayment } from '@/lib/payroll/sample-data';

export default function PayrollPage() {
  const [showStructureDialog, setShowStructureDialog] = React.useState(false);
  const [editingStructure, setEditingStructure] = React.useState<SalaryStructure | null>(null);
  const [showPayslipDialog, setShowPayslipDialog] = React.useState(false);
  const [payslipStructure, setPayslipStructure] = React.useState<SalaryStructure | null>(null);
  const [payslipMonth, setPayslipMonth] = React.useState(1);
  const [payslipYear, setPayslipYear] = React.useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const handleExportCSV = () => {
    // Simulate export
    const link = document.createElement('a');
    link.href = '#';
    link.click();
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleViewPayslipFromProcessor = (structure: SalaryStructure, month: number, year: number) => {
    setPayslipStructure(structure);
    setPayslipMonth(month);
    setPayslipYear(year);
    setShowPayslipDialog(true);
  };

  const handleViewPayslipFromPayment = (payment: SalaryPayment) => {
    // Find the salary structure for this payment
    const structure = salaryStructures.find(
      (s) => s.id === payment.salaryStructureId
    );
    if (structure) {
      setPayslipStructure(structure);
      setPayslipMonth(payment.month);
      setPayslipYear(payment.year);
      setShowPayslipDialog(true);
    }
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
        title="Payroll Management"
        description="Process salary payments, manage salary structures, and generate payslips"
        showBismillah
        actions={
          <div className="flex items-center gap-2">
            {(activeTab === 'structures' || activeTab === 'history') && (
              <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
            )}
            {activeTab === 'structures' && (
              <Button
                onClick={() => {
                  setEditingStructure(null);
                  setShowStructureDialog(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Structure
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="structures">Salary Structures</TabsTrigger>
          <TabsTrigger value="process">Process Payroll</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <PayrollDashboard />
        </TabsContent>

        {/* Salary Structures Tab */}
        <TabsContent value="structures" className="mt-6">
          <SalaryStructureList
            onView={(structure) => {
              setPayslipStructure(structure);
              setPayslipMonth(new Date().getMonth() + 1);
              setPayslipYear(new Date().getFullYear());
              setShowPayslipDialog(true);
            }}
            onEdit={(structure) => {
              setEditingStructure(structure);
              setShowStructureDialog(true);
            }}
          />
        </TabsContent>

        {/* Process Payroll Tab */}
        <TabsContent value="process" className="mt-6">
          <PayrollProcessor
            onViewPayslip={handleViewPayslipFromProcessor}
          />
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="mt-6">
          <SalaryPaymentList
            onViewPayslip={handleViewPayslipFromPayment}
          />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Salary Structure Dialog */}
      <Dialog open={showStructureDialog} onOpenChange={setShowStructureDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
            </DialogTitle>
            <DialogDescription>
              {editingStructure
                ? 'Update salary structure details and allowances'
                : 'Define salary structure with basic pay, allowances, and deductions'}
            </DialogDescription>
          </DialogHeader>
          <SalaryStructureForm
            editDefaults={editingStructure ?? undefined}
            onSuccess={() => {
              setShowStructureDialog(false);
              setEditingStructure(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Payslip View Dialog */}
      <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payslip</DialogTitle>
            <DialogDescription>
              Salary details for {payslipStructure?.employee.name ?? 'Employee'}
            </DialogDescription>
          </DialogHeader>
          {payslipStructure && (
            <PayslipView
              structure={payslipStructure}
              month={payslipMonth}
              year={payslipYear}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
