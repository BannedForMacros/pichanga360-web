'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { MapPin, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Container from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { CanchaSVG } from '@/components/public/CanchaSVG'
import {
  useCancha,
  useDisponibilidadCancha,
} from '@/hooks/canchas/useCancha'
import { formatCurrency } from '@/lib/utils'
import type { DeporteCodigo, SuperficieCodigo } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CanchaDetallePage({ params }: PageProps) {
  const { id } = use(params)
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))

  const { data: cancha, isLoading } = useCancha(id)
  const { data: disponibilidad } = useDisponibilidadCancha(id, fecha)

  if (isLoading) {
    return (
      <Container className="py-20">
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Container>
    )
  }

  if (!cancha) {
    return (
      <Container className="py-20">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-base font-semibold text-dark">
            Cancha no encontrada
          </p>
          <Link
            href="/buscar"
            className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
          >
            ← Volver a resultados
          </Link>
        </div>
      </Container>
    )
  }

  const deporteCodigo = cancha.tipoCancha?.deporte?.codigo?.toUpperCase()
  const superficieCodigo = cancha.superficie?.codigo?.toUpperCase()

  const precios = (cancha.tarifas ?? []).map((t) => ({
    tipo: t.tipo,
    precio: Number(t.precioHora),
  }))
  const minPrecio = precios.length
    ? Math.min(...precios.map((p) => p.precio))
    : 0
  const maxPrecio = precios.length
    ? Math.max(...precios.map((p) => p.precio))
    : 0

  return (
    <Container className="py-10">
      <Link href="/buscar" className="text-sm font-semibold text-primary hover:underline">
        ← Volver a resultados
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        <article>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <CanchaSVG
              deporte={(deporteCodigo as DeporteCodigo) ?? 'OTRO'}
              superficie={(superficieCodigo as SuperficieCodigo) ?? 'SINTETICO'}
              className="h-72 w-full"
            />
          </div>

          <div className="mt-6">
            <Badge variant="warning" size="md" className="bg-warning text-white">
              {cancha.tipoCancha?.deporte?.nombre ?? 'Cancha'}
            </Badge>
            <h1 className="mt-3 text-3xl font-bold text-dark">{cancha.nombre}</h1>
            {cancha.local && (
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                <MapPin size={14} /> {cancha.local.calle} {cancha.local.numero} ·{' '}
                {cancha.local.distrito} · {cancha.local.provincia}
              </p>
            )}
          </div>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-dark">Sobre la cancha</h2>
            <p className="mt-2 text-sm text-gray-700">
              {cancha.tipoCancha?.descripcion ?? cancha.superficie?.descripcion ??
                'Cancha disponible para reservas online a través de Pichanga360.'}
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
              <li className="flex items-center gap-2 text-gray-700">
                <Users size={16} className="text-primary" />
                {cancha.capacidadJugadores} jugadores
              </li>
              {cancha.superficie && (
                <li className="flex items-center gap-2 text-gray-700">
                  <Star size={16} className="text-primary" />
                  {cancha.superficie.nombre}
                </li>
              )}
              {cancha.estado && (
                <li className="flex items-center gap-2 text-gray-700">
                  <Badge
                    variant={
                      cancha.estado === 'ACTIVA'
                        ? 'success'
                        : cancha.estado === 'MANTENIMIENTO'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {cancha.estado}
                  </Badge>
                </li>
              )}
            </ul>
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-dark">
                  Horarios disponibles
                </h2>
                <p className="text-xs text-gray-500">
                  Disponibilidad por fecha
                </p>
              </div>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {!disponibilidad ? (
                <p className="col-span-full text-sm text-gray-500">
                  Cargando disponibilidad...
                </p>
              ) : disponibilidad.length === 0 ? (
                <p className="col-span-full text-sm text-gray-500">
                  No hay horarios disponibles para esta fecha.
                </p>
              ) : (
                disponibilidad.map((slot) => {
                  const inicio = new Date(slot.inicio).toLocaleTimeString(
                    'es-PE',
                    { hour: '2-digit', minute: '2-digit' }
                  )
                  return (
                    <button
                      key={slot.inicio}
                      disabled={!slot.disponible}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        slot.disponible
                          ? 'border-success bg-success-50 text-success-600 hover:bg-success hover:text-white'
                          : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 line-through'
                      }`}
                    >
                      {inicio}
                    </button>
                  )
                })
              )}
            </div>
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Precio por hora
            </p>
            <p className="text-3xl font-bold text-primary">
              {minPrecio > 0 ? formatCurrency(minPrecio) : 'Consultar'}
            </p>
            {maxPrecio > minPrecio && (
              <p className="mt-1 text-xs text-gray-500">
                Hora punta:{' '}
                <span className="font-semibold">{formatCurrency(maxPrecio)}</span>
              </p>
            )}

            <Button fullWidth size="lg" className="mt-5">
              Reservar ahora
            </Button>
            <Button variant="outline" fullWidth className="mt-2">
              Contactar al dueño
            </Button>

            <div className="mt-6 rounded-xl bg-success-50 p-3 text-xs text-success-600">
              ✓ Pago seguro · Yape · Plin · Transferencia
            </div>
          </div>
        </aside>
      </div>
    </Container>
  )
}
