import Link from 'next/link'

/**
 * Layout minimal usado durante el onboarding (creación del primer local).
 * No monta Sidebar ni LocalActualProvider — todavía no hay un local con
 * el cual contextualizar el dashboard.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <span className="text-sm font-black">P</span>
          </span>
          <span className="text-base font-extrabold tracking-tight text-primary">
            Pichanga<span className="text-warning">360</span>
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  )
}
