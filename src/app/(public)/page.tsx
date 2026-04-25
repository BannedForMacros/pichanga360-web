import Link from 'next/link'
import {
  CalendarCheck,
  Wallet,
  TrendingUp,
  ArrowRight,
  Star,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { HeroSearch } from '@/components/public/HeroSearch'
import { CanchaCard } from '@/components/public/CanchaCard'
import type { CanchaCardData } from '@/components/public/CanchaCard'

const destacadas: CanchaCardData[] = [
  {
    id: 'c-1',
    nombre: 'Cancha 1 — La Bombonera',
    deporte: 'FUTBOL',
    superficie: 'GRASS',
    distrito: 'San Isidro · Lima',
    precioPorHora: 120,
    rating: 4.9,
    totalReseñas: 218,
    disponibilidad: 'Disponible 19:00–22:00',
  },
  {
    id: 'c-2',
    nombre: 'Cancha Sintética Surco',
    deporte: 'FUTBOL',
    superficie: 'SINTETICO',
    distrito: 'Surco · Lima',
    precioPorHora: 90,
    rating: 4.8,
    totalReseñas: 154,
    disponibilidad: 'Disponible esta noche',
  },
  {
    id: 'c-3',
    nombre: 'Vóley Indoor Miraflores',
    deporte: 'VOLEY',
    superficie: 'CEMENTO',
    distrito: 'Miraflores · Lima',
    precioPorHora: 70,
    rating: 4.7,
    totalReseñas: 89,
    disponibilidad: 'Mañana 09:00–11:00',
  },
  {
    id: 'c-4',
    nombre: 'Básquet 360 La Molina',
    deporte: 'BASKET',
    superficie: 'CEMENTO',
    distrito: 'La Molina · Lima',
    precioPorHora: 80,
    rating: 4.8,
    totalReseñas: 102,
    disponibilidad: 'Disponible 17:00–19:00',
  },
]

const features = [
  {
    icon: <CalendarCheck size={22} />,
    title: 'Calendario inteligente',
    description: 'Sincroniza turnos en tiempo real para todas tus canchas.',
  },
  {
    icon: <Wallet size={22} />,
    title: 'Cobros automáticos',
    description: 'Yape, Plin, tarjeta y depósitos. Sin idas a recoger billetes.',
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
      <section
        className="relative overflow-hidden bg-primary text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 70%, rgba(245,166,35,0.18), transparent 40%)",
        }}
      >
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full opacity-15"
          viewBox="0 0 800 400"
          fill="none"
        >
          <rect
            x="40"
            y="40"
            width="720"
            height="320"
            rx="6"
            stroke="white"
            strokeWidth="2"
          />
          <line x1="400" y1="40" x2="400" y2="360" stroke="white" strokeWidth="2" />
          <circle cx="400" cy="200" r="60" stroke="white" strokeWidth="2" />
          <rect
            x="40"
            y="120"
            width="80"
            height="160"
            stroke="white"
            strokeWidth="2"
          />
          <rect
            x="680"
            y="120"
            width="80"
            height="160"
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center md:py-28">
          <Badge
            variant="warning"
            size="md"
            className="mx-auto bg-warning text-white"
          >
            ⚡ +2,400 canchas en todo el Perú
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Encuentra y reserva tu cancha{' '}
            <span className="text-warning">al instante</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">
            Fútbol, vóley, básquet y más. Compara horarios, precios y reseñas en
            segundos — sin llamar, sin chats, sin demoras.
          </p>
          <div className="mt-8 flex justify-center">
            <HeroSearch />
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 text-center text-white/90 md:gap-8">
            {[
              { value: '12K+', label: 'Reservas / mes' },
              { value: '4.9', label: 'Rating promedio' },
              { value: '28', label: 'Distritos' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-warning md:text-3xl">
                  {s.value}
                </p>
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Badge variant="success" size="md" className="mb-3">
              <Star size={12} className="fill-success-600" />
              Las más reservadas esta semana
            </Badge>
            <h2 className="text-2xl font-bold text-dark md:text-3xl">
              Canchas destacadas
            </h2>
          </div>
          <Link
            href="/buscar"
            className="hidden text-sm font-semibold text-primary hover:text-primary-700 md:inline-flex"
          >
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destacadas.map((c) => (
            <CanchaCard key={c.id} cancha={c} />
          ))}
        </div>
      </section>

      <section className="bg-primary-700 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
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
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Ver demo
              </Button>
            </div>
          </div>
          <div className="rounded-3xl bg-primary-600/30 p-6">
            <div className="rounded-2xl bg-white p-6 text-dark shadow-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  Reservas hoy
                </p>
                <Badge variant="success">+12%</Badge>
              </div>
              <p className="mt-2 text-3xl font-bold">18 reservas</p>
              <p className="mt-1 text-xs text-gray-500">vs. ayer (16)</p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-success-50 p-3">
                  <p className="text-xs font-semibold uppercase text-success-600">
                    Ingresos
                  </p>
                  <p className="text-lg font-bold text-success-600">S/ 2,160</p>
                </div>
                <div className="rounded-xl bg-warning-50 p-3">
                  <p className="text-xs font-semibold uppercase text-warning-600">
                    Ocupación
                  </p>
                  <p className="text-lg font-bold text-warning-600">78%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
