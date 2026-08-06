// ============================================================
// Madrasha ERP — Design Tokens
// Centralized design constants for consistent theming
// ============================================================

export const colors = {
  // Primary — Emerald Green (Islamic)
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  },
  // Accent — Warm Gold
  accent: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },
  // Semantic
  success: "#10b981",
  warning: "#f59e0b",
  error: "#e11d48",
  info: "#0284c7",
} as const;

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

export const typography = {
  fontFamily: {
    sans: "var(--font-sans), system-ui, sans-serif",
    bengali: "var(--font-bengali), sans-serif",
    arabic: "var(--font-arabic), serif",
    mono: "var(--font-mono), monospace",
  },
  fontSize: {
    display: "2.25rem",  // 36px
    h1: "1.875rem",      // 30px
    h2: "1.5rem",        // 24px
    h3: "1.25rem",       // 20px
    h4: "1.125rem",      // 18px
    body: "0.875rem",    // 14px
    caption: "0.75rem",  // 12px
    micro: "0.625rem",   // 10px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  },
} as const;

// Status color mapping for StatusBadge
export const statusColors = {
  active: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  inactive: { bg: "bg-stone-100 dark:bg-stone-800/30", text: "text-stone-600 dark:text-stone-400", dot: "bg-stone-400" },
  pending: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  paid: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  unpaid: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  partial: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  overdue: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  draft: { bg: "bg-stone-100 dark:bg-stone-800/30", text: "text-stone-600 dark:text-stone-400", dot: "bg-stone-400" },
  approved: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  rejected: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  completed: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500" },
  cancelled: { bg: "bg-stone-100 dark:bg-stone-800/30", text: "text-stone-600 dark:text-stone-400", dot: "bg-stone-400" },
  upcoming: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500" },
  graduated: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  transferred: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
} as const;

export type StatusType = keyof typeof statusColors;
