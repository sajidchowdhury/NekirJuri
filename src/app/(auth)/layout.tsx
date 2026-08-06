import IslamicPattern from '@/components/islamic/islamic-pattern'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Subtle Islamic pattern background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 dark:from-stone-950 dark:via-stone-900 dark:to-emerald-950/30">
        <IslamicPattern size="lg" opacity={0.03} className="text-emerald-700 dark:text-emerald-400" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
