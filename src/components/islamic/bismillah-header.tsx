'use client';

// ============================================================
// BismillahHeader — The Bismillah component for report headers
// Renders Arabic text with optional translation and decorative divider
// ============================================================

import { cn } from '@/lib/utils';
import GeometricDivider from '@/components/islamic/geometric-divider';

/** Size mapping for text classes */
const sizeMap = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
} as const;

/** Props for BismillahHeader component */
export interface BismillahHeaderProps {
  /** Additional CSS classes */
  className?: string;
  /** Show English translation below Arabic text (default: false) */
  showTranslation?: boolean;
  /** Size variant (default: 'md') */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * BismillahHeader renders the Bismillah in Arabic script
 * with optional English translation and a geometric divider below.
 * Styled in primary emerald color using the Arabic font.
 */
export default function BismillahHeader({
  className,
  showTranslation = false,
  size = 'md',
}: BismillahHeaderProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {/* Arabic Bismillah */}
      <p
        className={cn(
          'text-arabic text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed',
          sizeMap[size]
        )}
        dir="rtl"
        lang="ar"
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </p>

      {/* Optional English translation */}
      {showTranslation && (
        <p className="text-sm text-stone-500 dark:text-stone-400 italic text-center">
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>
      )}

      {/* Decorative geometric divider */}
      <GeometricDivider color="primary" className="max-w-xs" />
    </div>
  );
}
