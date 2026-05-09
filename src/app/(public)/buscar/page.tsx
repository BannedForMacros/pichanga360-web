'use client'

import { useMemo, useState } from 'react'
import { SlidersHorizontal, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Container from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import {
  FILTROS_DEFAULT,
  FiltrosBusqueda,
  type FiltrosBusquedaValue,
} from '@/components/public/FiltrosBusqueda'
import { ResultCard, type ResultCardData } from '@/components/public/ResultCard'
import { useLocales } from '@/hooks/locales/useLocales'
import type { Cancha, Local } from '@/types'

function localToResultCards(local: Local): ResultCardData[] {
  // Un local puede tener varias canchas; mostramos una card por cada cancha
  // (o una sola card si la respuesta del listado no expone canchas).
  const direccion = `${local.calle} ${local.numero}`
  const distrito = `${local.distrito} · ${local.provincia}`

  const canchas: Cancha[] = local.canchas ?? []
  if (canchas.length === 0) {
    return [
      {
        id: local.id,
        nombre: local.nombre,
        deporte: 'OTRO',
        superficie: 'SINTETICO',
        distrito,
        direccion,
        precioPorHora: 0,
        caracteristicas: ['Reserva al instante'],
        horariosLibres: [],
        distancia: 0,
      },
    ]
  }

  return canchas.map((c) => {
    const deporteCodigo = c.tipoCancha?.deporte?.codigo?.toUpperCase()
    const superficieCodigo = c.superficie?.codigo?.toUpperCase()

    const precios = (c.tarifas ?? []).map((t) => Number(t.precioHora))
    const minPrecio = precios.length ? Math.min(...precios) : 0

    return {
      id: c.id,
      nombre: `${local.nombre} — ${c.nombre}`,
      deporte: (deporteCodigo as ResultCardData['deporte']) ?? 'OTRO',
      superficie:
        (superficieCodigo as ResultCardData['superficie']) ?? 'SINTETICO',
      distrito,
      direccion,
      precioPorHora: minPrecio,
      caracteristicas: [
        c.superficie?.nombre ?? 'Superficie',
        `${c.capacidadJugadores} jugadores`,
      ],
      horariosLibres: [],
      distancia: 0,
    }
  })
}

export default function BuscarPage() {
  const [orden, setOrden] = useState<'precio' | 'rating'>('precio')
  const [filtrosOpen, setFiltrosOpen] = useState(false)
  const [filtros, setFiltros] = useState<FiltrosBusquedaValue>(FILTROS_DEFAULT)

  const { data, isLoading } = useLocales({
    limit: 30,
    deporteCodigo: filtros.deporteCodigo,
    distrito: filtros.distrito,
  })

  const resultados = useMemo(() => {
    if (!data?.data?.length) return []
    let flat = data.data.flatMap(localToResultCards)

    // Filtros client-side: superficies + precio máximo
    if (filtros.superficies.length > 0) {
      flat = flat.filter((c) =>
        filtros.superficies.includes(String(c.superficie).toUpperCase()),
      )
    }
    if (filtros.precioMax > 0) {
      flat = flat.filter(
        (c) => c.precioPorHora === 0 || c.precioPorHora <= filtros.precioMax,
      )
    }

    if (orden === 'precio')
      flat.sort((a, b) => a.precioPorHora - b.precioPorHora)
    return flat
  }, [data, orden, filtros])

  return (
    <Container className="py-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_400px]">
        {/* Filtros desktop */}
        <div className="hidden lg:block">
          <FiltrosBusqueda
            value={filtros}
            onChange={setFiltros}
            locales={data?.data ?? []}
          />
        </div>

        {/* Resultados */}
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-dark sm:text-2xl">
                {isLoading
                  ? 'Cargando...'
                  : `${resultados.length} canchas encontradas`}
              </h1>
              <p className="text-xs text-gray-500">
                {data?.meta?.total
                  ? `${data.meta.total} locales en total`
                  : 'Resultados disponibles'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<SlidersHorizontal size={14} />}
                onClick={() => setFiltrosOpen(true)}
                className="lg:hidden"
              >
                Filtros
              </Button>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as typeof orden)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="precio">Precio</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : resultados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <p className="text-base font-semibold text-dark">
                No encontramos canchas que coincidan
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Ajusta los filtros o cambia el deporte para ver más opciones.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1 2xl:grid-cols-2">
              {resultados.map((c) => (
                <ResultCard key={c.id} cancha={c} />
              ))}
            </div>
          )}
        </section>

        {/* Mapa desktop */}
        <aside className="hidden xl:block">
          <div className="sticky top-20 h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-xs">
                <label className="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-primary"
                  />
                  Buscar al mover el mapa
                </label>
                <span className="font-semibold text-primary">
                  {filtros.distrito ? filtros.distrito : 'Lima, Perú'}
                </span>
              </div>
              <div className="relative flex-1 bg-gradient-to-br from-primary-50 via-background to-primary-100">
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-30">
                  {Array.from({ length: 144 }).map((_, i) => (
                    <div key={i} className="border border-primary-100/60" />
                  ))}
                </div>
                {data?.data?.slice(0, 6).map((local, i) => (
                  <span
                    key={local.id}
                    className="absolute inline-flex items-center gap-1 rounded-full bg-warning px-2 py-1 text-xs font-bold text-white shadow-md ring-2 ring-white"
                    style={{
                      top: `${15 + (i * 11) % 70}%`,
                      left: `${10 + (i * 17) % 80}%`,
                    }}
                  >
                    <MapPin size={10} /> {local.distrito}
                  </span>
                ))}
                <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-medium text-gray-600 shadow">
                  Vista previa · activa Google Maps API para ver geolocalización
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Filtros mobile drawer */}
      <div
        className={`fixed inset-0 z-40 bg-dark/50 backdrop-blur-sm transition-opacity lg:hidden ${
          filtrosOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setFiltrosOpen(false)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-background p-4 transition-transform lg:hidden ${
          filtrosOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-dark">Filtros</h2>
          <Button variant="ghost" size="sm" onClick={() => setFiltrosOpen(false)}>
            Cerrar
          </Button>
        </div>
        <FiltrosBusqueda
          value={filtros}
          onChange={setFiltros}
          locales={data?.data ?? []}
        />
      </div>
    </Container>
  )
}
