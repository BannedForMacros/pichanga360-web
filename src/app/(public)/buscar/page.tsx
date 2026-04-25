'use client'

import { useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { FiltrosBusqueda } from '@/components/public/FiltrosBusqueda'
import { CanchaCard } from '@/components/public/CanchaCard'
import type { CanchaCardData } from '@/components/public/CanchaCard'

const canchasMock: (CanchaCardData & {
  direccion: string
  caracteristicas: string[]
  horariosLibres: string[]
  distancia: number
})[] = [
  {
    id: 'b-1',
    nombre: 'La Bombonera San Isidro',
    deporte: 'FUTBOL',
    superficie: 'GRASS',
    distrito: 'San Isidro',
    direccion: 'Av. Pardo y Aliaga 123',
    precioPorHora: 120,
    rating: 4.9,
    totalReseñas: 218,
    disponibilidad: '19:00 · 20:00 · 21:00',
    caracteristicas: ['Iluminación LED', 'Vestuarios', 'Estacionamiento'],
    horariosLibres: ['19:00', '20:00', '21:00'],
    distancia: 1.2,
  },
  {
    id: 'b-2',
    nombre: 'Sintética Surco Pro',
    deporte: 'FUTBOL',
    superficie: 'SINTETICO',
    distrito: 'Surco',
    direccion: 'Av. Caminos del Inca 1480',
    precioPorHora: 90,
    rating: 4.8,
    totalReseñas: 154,
    disponibilidad: '20:00 · 21:00',
    caracteristicas: ['Techada', 'Snack bar', 'Wifi'],
    horariosLibres: ['20:00', '21:00'],
    distancia: 4.6,
  },
  {
    id: 'b-3',
    nombre: 'Vóley Indoor Miraflores',
    deporte: 'VOLEY',
    superficie: 'CEMENTO',
    distrito: 'Miraflores',
    direccion: 'Av. Larco 850',
    precioPorHora: 70,
    rating: 4.7,
    totalReseñas: 89,
    disponibilidad: '18:00 · 19:00',
    caracteristicas: ['Aire acondicionado', 'Vestuarios'],
    horariosLibres: ['18:00', '19:00'],
    distancia: 3.1,
  },
  {
    id: 'b-4',
    nombre: 'Básquet 360 La Molina',
    deporte: 'BASKET',
    superficie: 'CEMENTO',
    distrito: 'La Molina',
    direccion: 'Av. La Molina 1750',
    precioPorHora: 80,
    rating: 4.8,
    totalReseñas: 102,
    disponibilidad: '17:00 · 18:00',
    caracteristicas: ['Iluminación LED', 'Marcador electrónico'],
    horariosLibres: ['17:00', '18:00'],
    distancia: 6.8,
  },
  {
    id: 'b-5',
    nombre: 'Pichanga San Borja',
    deporte: 'FUTBOL',
    superficie: 'SINTETICO',
    distrito: 'San Borja',
    direccion: 'Av. San Borja Sur 980',
    precioPorHora: 85,
    rating: 4.6,
    totalReseñas: 76,
    disponibilidad: '21:00 · 22:00',
    caracteristicas: ['Techada', 'Estacionamiento'],
    horariosLibres: ['21:00', '22:00'],
    distancia: 5.0,
  },
  {
    id: 'b-6',
    nombre: 'Tenis Club Miraflores',
    deporte: 'TENIS',
    superficie: 'CEMENTO',
    distrito: 'Miraflores',
    direccion: 'Av. Reducto 1290',
    precioPorHora: 60,
    rating: 4.7,
    totalReseñas: 54,
    disponibilidad: '07:00 · 08:00',
    caracteristicas: ['Cancha rápida', 'Vestuarios'],
    horariosLibres: ['07:00', '08:00'],
    distancia: 3.4,
  },
  {
    id: 'b-7',
    nombre: 'Fútbol Plaza San Isidro',
    deporte: 'FUTBOL',
    superficie: 'SINTETICO',
    distrito: 'San Isidro',
    direccion: 'Av. Javier Prado Oeste 540',
    precioPorHora: 110,
    rating: 4.9,
    totalReseñas: 167,
    disponibilidad: '18:00 · 19:00',
    caracteristicas: ['Techada', 'Snack bar', 'Wifi'],
    horariosLibres: ['18:00', '19:00'],
    distancia: 1.9,
  },
  {
    id: 'b-8',
    nombre: 'Multicancha La Molina',
    deporte: 'BASKET',
    superficie: 'MADERA',
    distrito: 'La Molina',
    direccion: 'Calle Las Camelias 220',
    precioPorHora: 75,
    rating: 4.5,
    totalReseñas: 41,
    disponibilidad: '17:00 · 18:00 · 19:00',
    caracteristicas: ['Indoor', 'Marcador'],
    horariosLibres: ['17:00', '18:00', '19:00'],
    distancia: 7.2,
  },
]

export default function BuscarPage() {
  const [orden, setOrden] = useState<'distancia' | 'precio' | 'rating'>('distancia')
  const [searchOnMove, setSearchOnMove] = useState(true)

  const ordenadas = useMemo(() => {
    const list = [...canchasMock]
    if (orden === 'distancia') list.sort((a, b) => a.distancia - b.distancia)
    if (orden === 'precio') list.sort((a, b) => a.precioPorHora - b.precioPorHora)
    if (orden === 'rating') list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    return list
  }, [orden])

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-5 px-6 py-6">
      <FiltrosBusqueda />

      <section className="flex-1 min-w-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-dark">
              {ordenadas.length} canchas en Lima
            </h1>
            <p className="text-xs text-gray-500">
              Resultados disponibles para hoy
            </p>
          </div>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as typeof orden)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none"
          >
            <option value="distancia">Ordenar por distancia</option>
            <option value="precio">Ordenar por precio</option>
            <option value="rating">Ordenar por rating</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ordenadas.map((c) => (
            <article
              key={c.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="grid grid-cols-[140px_1fr]">
                <div className="bg-primary-50">
                  <CanchaCard cancha={c} />
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-dark">{c.nombre}</h3>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        {c.direccion} · {c.distrito} · {c.distancia} km
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {c.caracteristicas.join(' · ')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.horariosLibres.map((h) => (
                      <span
                        key={h}
                        className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-600"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="hidden w-[400px] shrink-0 lg:block">
        <div className="sticky top-20 h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-xs">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={searchOnMove}
                  onChange={(e) => setSearchOnMove(e.target.checked)}
                  className="accent-primary"
                />
                Buscar al mover el mapa
              </label>
              <span className="font-semibold text-primary">Lima, Perú</span>
            </div>

            <div className="relative flex-1 bg-gradient-to-br from-primary-50 via-background to-primary-100">
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-30">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-primary-100/60" />
                ))}
              </div>
              {ordenadas.slice(0, 6).map((c, i) => (
                <span
                  key={c.id}
                  className="absolute inline-flex items-center gap-1 rounded-full bg-warning px-2 py-1 text-xs font-bold text-white shadow-md ring-2 ring-white"
                  style={{
                    top: `${15 + (i * 11) % 70}%`,
                    left: `${10 + (i * 17) % 80}%`,
                  }}
                >
                  S/ {c.precioPorHora}
                </span>
              ))}
              <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-gray-600 shadow">
                Mapa simulado · activa tu API key de Google Maps
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
