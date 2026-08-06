'use client';

// ============================================================
// Donations Page — Full donations management with dashboard, list, form
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
import DonationDashboard from '@/components/finance/donation-dashboard';
import DonorList from '@/components/finance/donor-list';
import DonationForm from '@/components/finance/donation-form';
import { slideUp } from '@/lib/animations';
import type { Donor } from '@/lib/finance/sample-data';

export default function DonationsPage() {
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editingDonor, setEditingDonor] = React.useState<Donor | null>(null);

  const handleExportCSV = () => {
    // Simulate export
    const link = document.createElement('a');
    link.href = '#';
    link.click();
  };

  const handleExportPDF = () => {
    // Simulate export
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
        title="Donation Management"
        description="Track donations, manage donors, and analyze giving patterns"

        actions={
          <div className="flex items-center gap-2">
            <ExportButton onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Donation
            </Button>
          </div>
        }
      />

      {/* Dashboard Stats + Chart */}
      <DonationDashboard />

      {/* Donor List */}
      <DonorList
        onView={(donor) => {
          // Could open a detail view
          setEditingDonor(donor);
        }}
        onEdit={(donor) => {
          setEditingDonor(donor);
          setShowAddDialog(true);
        }}
        onDelete={() => {
          // Could show confirmation
        }}
      />

      {/* Add/Edit Donation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDonor ? 'Edit Donation' : 'Record New Donation'}
            </DialogTitle>
            <DialogDescription>
              {editingDonor
                ? 'Update donation information'
                : 'Enter donation details to record a new contribution'}
            </DialogDescription>
          </DialogHeader>
          <DonationForm
            onSuccess={() => {
              setShowAddDialog(false);
              setEditingDonor(null);
            }}
            editDefaults={
              editingDonor
                ? {
                    donorName: editingDonor.name,
                    donorPhone: editingDonor.phone,
                    category: editingDonor.category,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
