// ============================================================
// Auth Layout — Layout for (auth) route group
// Since individual auth pages handle their own full-screen
// split layout with AuthPattern, this layout is minimal.
// It provides a subtle background for any nested content.
// ============================================================

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
