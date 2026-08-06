'use client';

// ============================================================
// QuickActions — Grid of action buttons for common tasks
// Admit Student, Collect Fee, Add Expense, Pay Salary
// ============================================================

import { motion } from 'framer-motion';
import { UserPlus, CreditCard, Receipt, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Quick action item */
interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

/** Available quick actions */
const actions: QuickAction[] = [
  {
    label: 'Admit Student',
    icon: UserPlus,
    href: '/academic/students',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Collect Fee',
    icon: CreditCard,
    href: '/finance/collections',
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Add Expense',
    icon: Receipt,
    href: '/finance/expenses',
    color: 'text-sky-600 dark:text-sky-400',
  },
  {
    label: 'Pay Salary',
    icon: Banknote,
    href: '/finance/payroll',
    color: 'text-violet-600 dark:text-violet-400',
  },
];

/** Stagger animation variants */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export interface QuickActionsProps {
  /** Optional className */
  className?: string;
}

/**
 * QuickActions displays a grid of action buttons for common tasks
 * with Framer Motion stagger animation on mount.
 */
export default function QuickActions({ className }: QuickActionsProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <motion.div key={action.label} variants={itemVariants}>
              <Button
                variant="outline"
                className="w-full h-auto py-4 flex flex-col items-center gap-2 rounded-lg border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/20 transition-all group"
                asChild
              >
                <a href={action.href}>
                  <Icon className={`h-6 w-6 ${action.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-xs font-medium text-foreground">
                    {action.label}
                  </span>
                </a>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
