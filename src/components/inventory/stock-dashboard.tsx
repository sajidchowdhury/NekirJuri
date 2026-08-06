'use client';

// ============================================================
// StockDashboard — Stock overview with stats, chart, and alerts
// ============================================================

import * as React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/molecules/stat-card';
import {
  formatTaka,
  getStockStatus,
  getInventorySummary,
  getCategoryStockData,
  sampleProducts,
  stockStatusClasses,
  categoryColorClasses,
} from '@/lib/inventory/sample-data';
import { staggerChildren, slideUp, transitions } from '@/lib/animations';

const CHART_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#64748b', '#06b6d4', '#9ca3af'];

export default function StockDashboard() {
  const summary = getInventorySummary();
  const categoryData = getCategoryStockData();
  const lowStockProducts = sampleProducts.filter(p => getStockStatus(p) === 'low-stock');
  const outOfStockProducts = sampleProducts.filter(p => getStockStatus(p) === 'out-of-stock');

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <motion.div
        initial={staggerChildren.initial}
        animate={staggerChildren.animate}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total Stock Value"
          value={formatTaka(summary.totalStockValue)}
          icon={TrendingUp}
          variant="emerald"
        />
        <StatCard
          title="Total Products"
          value={summary.totalProducts.toString()}
          icon={Package}
          variant="default"
        />
        <StatCard
          title="Low Stock Items"
          value={summary.lowStockItems.toString()}
          icon={AlertTriangle}
          variant="gold"
        />
        <StatCard
          title="Out of Stock"
          value={summary.outOfStockItems.toString()}
          icon={XCircle}
          variant="rose"
        />
      </motion.div>

      {/* Stock Levels Chart */}
      <motion.div
        initial={slideUp.initial}
        animate={slideUp.animate}
        transition={transitions.normal}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Levels by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'minStock' ? `Min: ${value}` : `Stock: ${value}`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="totalStock" name="Current Stock" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                  <ReferenceLine y={0} stroke="transparent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Legend for min stock line */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>Bar height = current stock level</span>
              <span>• Colored by category</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div
          initial={slideUp.initial}
          animate={slideUp.animate}
          transition={transitions.normal}
        >
          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockProducts.map(product => {
                  const catColors = categoryColorClasses[product.category];
                  return (
                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800 p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`${catColors.bg} ${catColors.text} text-[10px]`}>
                            {product.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {product.currentStock} / {product.minStockLevel} min
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
                        Reorder
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Out of Stock */}
      {outOfStockProducts.length > 0 && (
        <motion.div
          initial={slideUp.initial}
          animate={slideUp.animate}
          transition={transitions.normal}
        >
          <Card className="border-rose-200 dark:border-rose-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="h-5 w-5 text-rose-500" />
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {outOfStockProducts.map(product => {
                  const catColors = categoryColorClasses[product.category];
                  return (
                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-rose-200 dark:border-rose-800 p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`${catColors.bg} ${catColors.text} text-[10px]`}>
                            {product.category}
                          </Badge>
                          <Badge variant="secondary" className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-[10px]">
                            0 in stock
                          </Badge>
                        </div>
                      </div>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs">
                        Reorder
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
