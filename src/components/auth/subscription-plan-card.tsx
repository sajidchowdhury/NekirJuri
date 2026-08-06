'use client';

// ============================================================
// SubscriptionPlanCard — Plan selection card for registration
// Gold border for recommended, emerald badge for selected
// Feature list with check icons
// ============================================================

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Props for SubscriptionPlanCard */
export interface SubscriptionPlanCardProps {
  /** Plan name */
  name: string;
  /** Price string (e.g., "$9.99/mo") */
  price: string;
  /** Features list */
  features: string[];
  /** Whether this plan is recommended */
  isRecommended?: boolean;
  /** Whether this plan is currently selected */
  isSelected?: boolean;
  /** Callback when plan is selected */
  onSelect: () => void;
  /** Plan ID for form value */
  planId: string;
  /** Additional className */
  className?: string;
}

/**
 * SubscriptionPlanCard renders a plan selection card
 * with feature list, price, and selection state.
 */
export default function SubscriptionPlanCard({
  name,
  price,
  features,
  isRecommended = false,
  isSelected = false,
  onSelect,
  className,
}: SubscriptionPlanCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onSelect}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200',
        // Selected state: emerald border
        isSelected
          ? 'border-emerald-600 bg-emerald-50/50 shadow-md dark:border-emerald-500 dark:bg-emerald-950/30'
          : 'border-border bg-card hover:border-emerald-300 hover:shadow-sm dark:hover:border-emerald-700',
        // Recommended state: gold border override when not selected
        isRecommended && !isSelected && 'border-amber-400 dark:border-amber-500',
        className,
      )}
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm dark:bg-amber-600">
            <Star className="size-3" />
            Recommended
          </span>
        </div>
      )}

      {/* Selected badge */}
      {isSelected && (
        <div className="absolute -top-3 right-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm dark:bg-emerald-600">
            <Check className="size-3" />
            Selected
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="text-center mb-3">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
          {price}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-3" />

      {/* Features list */}
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="size-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Selection indicator */}
      <div className="mt-4 flex justify-center">
        <div
          className={cn(
            'size-5 rounded-full border-2 transition-all duration-200',
            isSelected
              ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-muted-foreground/30',
          )}
        >
          {isSelected && (
            <Check className="size-3.5 text-white mx-auto mt-[1px]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
