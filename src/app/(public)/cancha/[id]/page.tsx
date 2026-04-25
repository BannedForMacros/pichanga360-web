import Link from 'next/link'
import { MapPin, Star, Clock, Users, Wifi, ParkingCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CanchaSVG } from '@/components/public/CanchaSVG'
import { formatCurrency } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

const horarios = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']
const ocupados = ['18:00', '19:00']

export default async function CanchaDetallePage({ params }: PageProps) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link href="/buscar" className="text-sm font-semibold text-primary hover:underline">
        ← Volver a resultados
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        <article>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <CanchaSVG deporte="FUTBOL" superficie="GRASS" className="h-72 w-full" />
          </div>

          <div className="mt-6">
            <Badge variant="warning" size="md" className="bg-warning text-white">
              Fútbol
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-dark">
              La Bombonera San Isidro
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={14} /> Av. Pardo y Aliaga 123 · San Isidro · Lima
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold text-warning-600">
                <Star size={14} className="fill-warning text-warning" />
                4.9
              </span>
              <span className="text-gray-500">(218 reseñas)</span>
            </div>
          </div>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-dark">Sobre la cancha</h2>
            <p className="mt-2 text-sm text-gray-700">
              Cancha de grass natural de 11 vs 11 con iluminación LED, vestuarios
              equipados y estacionamiento. Atendemos partidos amistosos, ligas y
              entrenamientos de academias de fútbol todo el año.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <li className="flex items-center gap-2 text-gray-700">
                <Users size={16} className="text-primary" /> 22 jugadores
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Clock size={16} className="text-primary" /> 7:00 — 23:00
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Wifi size={16} className="text-primary" /> Wifi gratuito
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <ParkingCircle size={16} className="text-primary" /> Estacionamiento
              </li>
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-dark">Horarios disponibles</h2>
            <p className="mt-1 text-xs text-gray-500">
              Cancha #{id} · Horarios para hoy
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {horarios.map((h) => {
                const ocupado = ocupados.includes(h)
                return (
                  <button
                    key={h}
                    disabled={ocupado}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      ocupado
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 line-through'
                        : 'border-success bg-success-50 text-success-600 hover:bg-success hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                )
              })}
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Precio por hora
            </p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(120)}</p>
            <p className="mt-1 text-xs text-gray-500">
              Hora punta: <span className="font-semibold">{formatCurrency(140)}</span>
            </p>

            <Button fullWidth size="lg" className="mt-5">
              Reservar ahora
            </Button>
            <Button variant="outline" fullWidth className="mt-2">
              Contactar al dueño
            </Button>

            <div className="mt-6 rounded-xl bg-success-50 p-3 text-xs text-success-600">
              ✓ Pago seguro · Yape · Plin · Tarjeta
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
