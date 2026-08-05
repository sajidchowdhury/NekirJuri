'use client'

import { motion } from 'framer-motion'
import { staggerChildren, slideUp } from '@/lib/animations'
import CrescentLogo from '@/components/islamic/crescent-logo'
import IslamicPattern from '@/components/islamic/islamic-pattern'
import ArchCard, { ArchCardHeader, ArchCardTitle, ArchCardDescription, ArchCardContent } from '@/components/islamic/arch-card'
import GeometricDivider from '@/components/islamic/geometric-divider'
import BismillahHeader from '@/components/islamic/bismillah-header'
import StatusBadge from '@/components/atoms/status-badge'
import PageHeader from '@/components/atoms/page-header'
import EmptyState from '@/components/atoms/empty-state'
import { StatCardSkeleton, TableSkeleton, FormSkeleton, ChartSkeleton } from '@/components/atoms/loading-skeleton'
import { ThemeToggle } from '@/components/atoms/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, DollarSign, GraduationCap, BookOpen, Plus, Search, Settings, ChevronRight } from 'lucide-react'
import type { StatusType } from '@/lib/design-tokens'

const allStatuses: StatusType[] = [
  'active', 'inactive', 'pending', 'paid', 'unpaid',
  'partial', 'overdue', 'draft', 'approved', 'rejected', 'completed', 'cancelled'
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Islamic Pattern Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <IslamicPattern opacity={0.03} size="lg" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Bar */}
        <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CrescentLogo size="sm" animated={false} />
              <span className="font-semibold text-foreground">Madrasha ERP</span>
              <Badge variant="secondary" className="text-xs bg-primary-soft text-primary">Phase 0</Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* === HERO SECTION === */}
          <motion.div
            variants={staggerChildren}
            initial="initial"
            animate="animate"
            className="text-center space-y-4"
          >
            <motion.div variants={slideUp} className="flex justify-center">
              <CrescentLogo size="lg" animated />
            </motion.div>
            <motion.h1 variants={slideUp} className="text-3xl sm:text-4xl font-bold text-foreground">
              Madrasha ERP
            </motion.h1>
            <motion.p variants={slideUp} className="text-muted-foreground max-w-md mx-auto">
              Islamic Education Management System — Design System Foundation
            </motion.p>
            <motion.div variants={slideUp}>
              <BismillahHeader size="md" showTranslation />
            </motion.div>
          </motion.div>

          <GeometricDivider color="primary" />

          {/* === COLOR PALETTE SHOWCASE === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Color Palette — Emerald & Gold</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Primary Colors */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Primary (Emerald)</p>
                <div className="space-y-1">
                  {[
                    { name: '700', className: 'bg-emerald-700' },
                    { name: '500', className: 'bg-emerald-500' },
                    { name: '400', className: 'bg-emerald-400' },
                    { name: '100', className: 'bg-emerald-100' },
                    { name: '50', className: 'bg-emerald-50 dark:bg-emerald-900/30' },
                  ].map(c => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-md ${c.className} border border-border/50`} />
                      <span className="text-xs text-muted-foreground">Emerald {c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accent (Gold)</p>
                <div className="space-y-1">
                  {[
                    { name: '600', className: 'bg-amber-600' },
                    { name: '500', className: 'bg-amber-500' },
                    { name: '400', className: 'bg-amber-400' },
                    { name: '100', className: 'bg-amber-100' },
                    { name: '50', className: 'bg-amber-50 dark:bg-amber-900/30' },
                  ].map(c => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-md ${c.className} border border-border/50`} />
                      <span className="text-xs text-muted-foreground">Amber {c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semantic Colors */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Semantic</p>
                <div className="space-y-1">
                  {[
                    { name: 'Success', className: 'bg-emerald-500' },
                    { name: 'Warning', className: 'bg-amber-500' },
                    { name: 'Error', className: 'bg-rose-500' },
                    { name: 'Info', className: 'bg-sky-500' },
                  ].map(c => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-md ${c.className}`} />
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Neutral Colors */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Neutral (Warm Stone)</p>
                <div className="space-y-1">
                  {[
                    { name: '900', className: 'bg-stone-900 dark:bg-stone-100' },
                    { name: '500', className: 'bg-stone-500' },
                    { name: '200', className: 'bg-stone-200 dark:bg-stone-700' },
                    { name: '100', className: 'bg-stone-100 dark:bg-stone-800' },
                    { name: '50', className: 'bg-stone-50 dark:bg-stone-900' },
                  ].map(c => (
                    <div key={c.name} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-md ${c.className} border border-border/50`} />
                      <span className="text-xs text-muted-foreground">Stone {c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* === ARCH CARD SHOWCASE === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">ArchCard — Islamic Card Variants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ArchCard accentColor="primary">
                <ArchCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <ArchCardTitle className="text-sm">Total Students</ArchCardTitle>
                    </div>
                  </div>
                </ArchCardHeader>
                <ArchCardContent>
                  <p className="text-2xl font-bold text-foreground">1,250</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-[-90deg]" /> +12% from last month
                  </p>
                </ArchCardContent>
              </ArchCard>

              <ArchCard accentColor="primary">
                <ArchCardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <ArchCardTitle className="text-sm">Fee Collection</ArchCardTitle>
                  </div>
                </ArchCardHeader>
                <ArchCardContent>
                  <p className="text-2xl font-bold text-foreground">৳4.2L</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-[-90deg]" /> +8% from last month
                  </p>
                </ArchCardContent>
              </ArchCard>

              <ArchCard accentColor="accent">
                <ArchCardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <ArchCardTitle className="text-sm">Pending Fees</ArchCardTitle>
                  </div>
                </ArchCardHeader>
                <ArchCardContent>
                  <p className="text-2xl font-bold text-foreground">৳85K</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-[90deg]" /> -3% from last month
                  </p>
                </ArchCardContent>
              </ArchCard>

              <ArchCard accentColor="accent" showPattern>
                <ArchCardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <ArchCardTitle className="text-sm">Teachers</ArchCardTitle>
                  </div>
                </ArchCardHeader>
                <ArchCardContent>
                  <p className="text-2xl font-bold text-foreground">48</p>
                  <p className="text-xs text-muted-foreground">Active this session</p>
                </ArchCardContent>
              </ArchCard>
            </div>
          </section>

          <GeometricDivider color="accent" />

          {/* === STATUS BADGE SHOWCASE === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">StatusBadge — All Status Types</h2>
            <div className="flex flex-wrap gap-3">
              {allStatuses.map(status => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {allStatuses.map(status => (
                <StatusBadge key={`nodot-${status}`} status={status} showDot={false} />
              ))}
            </div>
          </section>

          {/* === BISMILLAH SIZES === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">BismillahHeader — Size Variants</h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Small</p>
                <BismillahHeader size="sm" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Medium (Default)</p>
                <BismillahHeader size="md" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Large + Translation</p>
                <BismillahHeader size="lg" showTranslation />
              </div>
            </div>
          </section>

          <GeometricDivider color="muted" />

          {/* === BUTTONS & BADGES === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Buttons — Primary & Accent</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Student
              </Button>
              <Button variant="outline" className="border-emerald-700 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-900/30">
                <Search className="h-4 w-4 mr-1" /> Search
              </Button>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <DollarSign className="h-4 w-4 mr-1" /> Collect Fee
              </Button>
              <Button variant="secondary">
                <Settings className="h-4 w-4 mr-1" /> Settings
              </Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="destructive">Delete</Button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</Badge>
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>
              <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Overdue</Badge>
              <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">Info</Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400">Premium</Badge>
            </div>
          </section>

          {/* === PAGE HEADER DEMO === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">PageHeader — With Bismillah</h2>
            <PageHeader
              title="Student Management"
              description="Manage student admissions, enrollment, and academic records"
              showBismillah
              actions={
                <div className="flex gap-2">
                  <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Plus className="h-4 w-4 mr-1" /> Add Student
                  </Button>
                  <Button variant="outline" className="border-emerald-700 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400">
                    <Search className="h-4 w-4 mr-1" /> Search
                  </Button>
                </div>
              }
            />
          </section>

          {/* === EMPTY STATE DEMO === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">EmptyState — No Data</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ArchCard>
                <ArchCardContent className="p-0">
                  <EmptyState
                    title="No students found"
                    description="Start by admitting your first student to the madrasha"
                    action={{ label: 'Admit Student', onClick: () => {} }}
                  />
                </ArchCardContent>
              </ArchCard>
              <ArchCard>
                <ArchCardContent className="p-0">
                  <EmptyState
                    title="No fee collections yet"
                    description="Fee collections will appear here once payments are recorded"
                  />
                </ArchCardContent>
              </ArchCard>
            </div>
          </section>

          <GeometricDivider color="primary" />

          {/* === SKELETON LOADERS === */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">LoadingSkeleton — Skeleton Patterns</h2>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Stat Cards</p>
              <StatCardSkeleton />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">Table (5 rows, 4 columns)</p>
              <TableSkeleton rows={5} columns={4} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Form (4 fields)</p>
                <FormSkeleton fields={4} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Chart</p>
                <ChartSkeleton />
              </div>
            </div>
          </section>

          {/* === GEOMETRIC DIVIDERS === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">GeometricDivider — Color Variants</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Primary (Emerald)</p>
                <GeometricDivider color="primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Accent (Gold)</p>
                <GeometricDivider color="accent" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Muted (Stone)</p>
                <GeometricDivider color="muted" />
              </div>
            </div>
          </section>

          {/* === ISLAMIC PATTERN SIZES === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">IslamicPattern — Size & Opacity Variants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['sm', 'md', 'lg'] as const).map(size => (
                <ArchCard key={size}>
                  <ArchCardHeader>
                    <ArchCardTitle className="text-sm capitalize">Size: {size}</ArchCardTitle>
                  </ArchCardHeader>
                  <ArchCardContent>
                    <div className="relative h-32 rounded-md overflow-hidden bg-emerald-50 dark:bg-emerald-900/20">
                      <IslamicPattern size={size} opacity={0.1} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{size} tile</span>
                      </div>
                    </div>
                  </ArchCardContent>
                </ArchCard>
              ))}
            </div>
          </section>

          {/* === CRESCENT LOGO SIZES === */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">CrescentLogo — Size Variants</h2>
            <div className="flex items-end gap-6">
              {(['sm', 'md', 'lg'] as const).map(size => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <CrescentLogo size={size} animated={size === 'lg'} />
                  <span className="text-xs text-muted-foreground capitalize">{size}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <GeometricDivider color="muted" />
          <footer className="text-center py-6 text-sm text-muted-foreground">
            <p>Madrasha ERP — Phase 0: Design System Foundation</p>
            <p className="text-xs mt-1">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
