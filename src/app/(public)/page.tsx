import Link from 'next/link'
import {
  CalendarCheck,
  Wallet,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Container from '@/components/ui/Container'
import { HeroSearch } from '@/components/public/HeroSearch'
import { CanchasDestacadas } from '@/components/public/CanchasDestacadas'
import { HeroBadgeCount, HeroStats } from '@/components/public/HeroStats'

const features = [
  {
    icon: <CalendarCheck size={22} />,
    title: 'Calendario inteligente',
    description: 'Sincroniza turnos en tiempo real para todas tus canchas.',
  },
  {
    icon: <Wallet size={22} />,
    title: 'Cobros automáticos',
    description: 'Yape, Plin, transferencia y depósitos. Sin idas a recoger billetes.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Métricas en vivo',
    description: 'Ocupación, ingresos y horarios pico al instante.',
  },
]

export default function LandingPage() {
  return (
    <>
      {/* HERO — full width azul, contenido centrado por Container */}
      <section
        className="relative w-full overflow-hidden bg-primary text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 70%, rgba(245,166,35,0.18), transparent 40%)",
        }}
      >
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

        <Container className="relative py-20">
          <div className="text-center">
            <Badge variant="warning" size="md" className="mx-auto bg-warning text-white">
              <HeroBadgeCount />
            </Badge>

            <h1 className="mx-auto mt-6 max-w-4xl text-center text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Encuentra y reserva tu cancha{' '}
              <span className="text-warning">al instante</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
              Fútbol, vóley, básquet y más. Compara horarios, precios y reseñas en
              segundos — sin llamar, sin chats, sin demoras.
            </p>

            <div className="mx-auto mt-8 flex max-w-3xl justify-center">
              <HeroSearch />
            </div>

            <HeroStats />
          </div>
        </Container>
      </section>

      {/* CANCHAS DESTACADAS — datos reales de /locales */}
      <CanchasDestacadas />

      {/* PARA DUEÑOS — full width azul oscuro */}
      <section className="w-full bg-primary-700 text-white">
        <Container className="py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <Badge variant="warning" className="bg-warning text-white">
                Para dueños de canchas
              </Badge>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
                ¿Tienes una cancha? Llénala todos los días.
              </h2>
              <p className="mt-4 text-base text-white/80">
                Pichanga360 es el sistema más completo del Perú para gestionar
                reservas, cobros y reportes en tiempo real.
              </p>
              <ul className="mt-6 space-y-4">
                {features.map((f) => (
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-2xl bg-primary-600/40 p-4"
                  >
                    <span className="rounded-xl bg-warning/20 p-2 text-warning">
                      {f.icon}
                    </span>
                    <div>
                      <p className="font-semibold">{f.title}</p>
                      <p className="text-sm text-white/70">{f.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/registro">
                  <Button variant="warning" rightIcon={<ArrowRight size={16} />}>
                    Registrar mi cancha
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Ver demo
                </Button>
              </div>
            </div>

            <div className="rounded-3xl bg-primary-600/30 p-6">
              <div className="rounded-2xl bg-white p-6 text-dark shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-500">
                    Tu panel de control
                  </p>
                  <Badge variant="success">En vivo</Badge>
                </div>
                <p className="mt-2 text-3xl font-bold">Reservas, pagos y reportes</p>
                <p className="mt-1 text-xs text-gray-500">
                  Todo en una sola vista, conectado a tu base de datos.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-success-50 p-3">
                    <p className="text-xs font-semibold uppercase text-success-600">
                      Pagos
                    </p>
                    <p className="text-sm font-semibold text-success-600">
                      Yape · Plin · Transferencia
                    </p>
                  </div>
                  <div className="rounded-xl bg-warning-50 p-3">
                    <p className="text-xs font-semibold uppercase text-warning-600">
                      Reportes
                    </p>
                    <p className="text-sm font-semibold text-warning-600">
                      Ocupación e ingresos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
