'use client';

// ============================================================
// Stock Dashboard & Movement Log Page — Two tabs
// Fully wired to API — no sample data fallbacks
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/atoms/page-header';
import ExportButton from '@/components/molecules/export-button';
import StockDashboard from '@/components/inventory/stock-dashboard';
import StockMovementLog from '@/components/inventory/stock-movement-log';
import { fadeIn, slideUp, transitions } from '@/lib/animations';

export default function StockPage() {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={transitions.normal}
      className="space-y-6"
    >
      <PageHeader
        title="Stock Management"
        description="Monitor stock levels, movements, and inventory status"
        actions={
          <div className="flex items-center gap-2">
            <ExportButton />
          </div>
        }
      />

      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
            <TabsTrigger value="dashboard" className="gap-1.5">
              <BarChart3 className="h-4 w-4 hidden sm:inline" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="movements" className="gap-1.5">
              <Clock className="h-4 w-4 hidden sm:inline" />
              Movement Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <StockDashboard />
          </TabsContent>

          <TabsContent value="movements">
            <StockMovementLog />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
