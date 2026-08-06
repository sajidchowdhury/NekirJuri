import ArchCard from '@/components/islamic/arch-card'

export default function LoginPage() {
  return (
    <ArchCard showPattern className="w-full">
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Login</h1>
        <p className="text-muted-foreground">
          Coming in Phase 2
        </p>
        <div className="pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-emerald-700 dark:text-emerald-400"
            >
              <circle cx="20" cy="24" r="14" fill="currentColor" opacity="0.9" />
              <circle cx="25" cy="22" r="12" fill="white" className="dark:fill-stone-900" />
              <path
                d="M36 8L37.5 12.5L42 14L37.5 15.5L36 20L34.5 15.5L30 14L34.5 12.5Z"
                fill="currentColor"
                opacity="0.85"
              />
            </svg>
          </div>
        </div>
      </div>
    </ArchCard>
  )
}
