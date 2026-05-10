'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useLocales } from '@/hooks/locales/useLocales'
import { CanchaCard, type CanchaCardData } from '@/components/public/CanchaCard'
import type { Local, Cancha, DeporteCodigo, SuperficieCodigo } from '@/types'

function pickFeatured(local: Local): CanchaCardData | null {
  const cancha: Cancha | undefined = local.canchas?.[0]
  if (!cancha) {
    return {
      id: local.id,
      nombre: local.nombre,
      deporte: 'OTRO',
      superficie: 'SINTETICO',
      distrito: `${local.distrito} · ${local.provincia}`,
      precioPorHora: 0,
      disponibilidad: 'Disponible hoy',
    }
  }
  const deporteCodigo = cancha.tipoCancha?.deporte?.codigo?.toUpperCase()
  const superficieCodigo = cancha.superficie?.codigo?.toUpperCase()
  const precios = (cancha.tarifas ?? []).map((t) => Number(t.precioHora))
  const minPrecio = precios.length ? Math.min(...precios) : 0

  return {
    id: cancha.id,
    nombre: `${local.nombre} — ${cancha.nombre}`,
    deporte: (deporteCodigo as DeporteCodigo) ?? 'OTRO',
    superficie: (superficieCodigo as SuperficieCodigo) ?? 'SINTETICO',
    distrito: `${local.distrito} · ${local.provincia}`,
    precioPorHora: minPrecio,
    disponibilidad: 'Reserva al instante',
  }
}

export function CanchasDestacadas() {
  const { data, isLoading } = useLocales({ limit: 4 })
  const cards = (data?.data ?? [])
    .map(pickFeatured)
    .filter((c): c is CanchaCardData => c !== null)

  return (
    <section className="w-full bg-background py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
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
            className="text-sm font-semibold text-primary hover:text-primary-700"
          >
            Ver todas →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-dark">
              Aún no hay canchas publicadas
            </p>
            <p className="mt-1 text-sm text-gray-600">
              ¿Eres dueño de una cancha?{' '}
              <Link
                href="/registro"
                className="font-semibold text-primary hover:underline"
              >
                Regístrala aquí
              </Link>{' '}
              y empieza a recibir reservas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <CanchaCard key={c.id} cancha={c} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
