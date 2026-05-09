import Link from 'next/link'
import { ArrowLeft, LayoutDashboard, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function NotFound() {
  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-primary px-4 py-16 text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 70%, rgba(245,166,35,0.20), transparent 40%)",
      }}
    >
      {/* Cancha de fondo (decorativa) */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full opacity-15"
        viewBox="0 0 800 400"
        fill="none"
        aria-hidden
      >
        <rect x="40" y="40" width="720" height="320" rx="6" stroke="white" strokeWidth="2" />
        <line x1="400" y1="40" x2="400" y2="360" stroke="white" strokeWidth="2" />
        <circle cx="400" cy="200" r="60" stroke="white" strokeWidth="2" />
        <rect x="40" y="120" width="80" height="160" stroke="white" strokeWidth="2" />
        <rect x="680" y="120" width="80" height="160" stroke="white" strokeWidth="2" />
      </svg>

      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Logo */}
        <Link
          href="/"
          className="mx-auto mb-10 inline-flex items-center gap-2"
          aria-label="Inicio Pichanga360"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
            <span className="text-base font-black">P</span>
          </span>
          <span className="text-base font-extrabold tracking-tight text-white">
            Pichanga<span className="text-warning">360</span>
          </span>
        </Link>

        <Badge variant="warning" size="md" className="mx-auto bg-warning text-white">
          Error 404
        </Badge>

        {/* Número grande estilo marcador */}
        <p className="mt-6 select-none text-[120px] font-black leading-none tracking-tight text-warning drop-shadow-lg sm:text-[160px]">
          4<span className="text-white">0</span>4
        </p>

        <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          Esta cancha no está en el sistema
        </h1>

        <p className="mx-auto mt-3 max-w-md text-base text-white/80">
          La página que buscas se mudó, no existe todavía o el partido ya
          terminó. Vuelve al inicio o usa el dashboard para seguir reservando.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button variant="warning" leftIcon={<ArrowLeft size={16} />}>
              Volver al inicio
            </Button>
          </Link>
          <Link href="/buscar">
            <Button
              variant="outline"
              leftIcon={<Search size={16} />}
              className="border-white text-white hover:bg-white/10"
            >
              Buscar canchas
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              leftIcon={<LayoutDashboard size={16} />}
              className="text-white hover:bg-white/10"
            >
              Ir al dashboard
            </Button>
          </Link>
        </div>

        <p className="mt-10 text-xs text-white/50">
          Si llegaste aquí desde un link interno, avísale al equipo —
          probablemente es un módulo que aún no tiene página.
        </p>
      </div>
    </main>
  )
}
