'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import { useDeportes } from '@/hooks/catalogos/useDeportes'
import { useSuperficies } from '@/hooks/catalogos/useSuperficies'
import type { Local } from '@/types'

export interface FiltrosBusquedaValue {
  deporteCodigo?: string
  distrito?: string
  superficies: string[]
  precioMax: number
}

export const FILTROS_DEFAULT: FiltrosBusquedaValue = {
  deporteCodigo: undefined,
  distrito: undefined,
  superficies: [],
  precioMax: 300,
}

interface Props {
  value: FiltrosBusquedaValue
  onChange: (next: FiltrosBusquedaValue) => void
  /** Locales actualmente listados, para extraer distritos disponibles con sus counts. */
  locales?: Local[]
}

export function FiltrosBusqueda({ value, onChange, locales = [] }: Props) {
  const { data: deportes, isLoading: loadingDeportes } = useDeportes()
  const { data: superficies, isLoading: loadingSuperficies } = useSuperficies()

  // Distritos extraídos de los locales devueltos por el backend
  const distritos = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of locales) {
      map.set(l.distrito, (map.get(l.distrito) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count)
  }, [locales])

  const set = (patch: Partial<FiltrosBusquedaValue>) =>
    onChange({ ...value, ...patch })

  const toggleSuperficie = (codigo: string) => {
    const exists = value.superficies.includes(codigo)
    set({
      superficies: exists
        ? value.superficies.filter((c) => c !== codigo)
        : [...value.superficies, codigo],
    })
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 lg:sticky lg:top-20">
      <h3 className="mb-4 hidden text-sm font-semibold text-dark lg:block">Filtros</h3>

      {/* Deporte */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Deporte
        </p>
        {loadingDeportes ? (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Spinner size="sm" /> Cargando…
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => set({ deporteCodigo: undefined })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                !value.deporteCodigo
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary',
              )}
            >
              Todos
            </button>
            {(deportes ?? []).map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  set({
                    deporteCodigo:
                      value.deporteCodigo === d.codigo ? undefined : d.codigo,
                  })
                }
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition',
                  value.deporteCodigo === d.codigo
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary',
                )}
              >
                {d.nombre}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Precio (filtro client-side, el endpoint no soporta precio aún) */}
      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Precio / hora
        </p>
        <input
          type="range"
          min={20}
          max={300}
          step={10}
          value={value.precioMax}
          onChange={(e) => set({ precioMax: Number(e.target.value) })}
          className="w-full accent-primary"
        />
        <p className="mt-1 text-xs text-gray-600">
          Hasta{' '}
          <span className="font-semibold text-dark">S/ {value.precioMax}</span>
        </p>
      </section>

      {/* Distritos (derivados del listado actual) */}
      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Distrito
        </p>
        {distritos.length === 0 ? (
          <p className="text-xs text-gray-500">
            Aparecerán al cargar los locales.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {distritos.map((d) => (
              <li
                key={d.nombre}
                className="flex items-center justify-between text-sm"
              >
                <label className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="distrito"
                    checked={value.distrito === d.nombre}
                    onChange={() => set({ distrito: d.nombre })}
                    className="accent-primary"
                  />
                  {d.nombre}
                </label>
                <span className="text-xs text-gray-500">{d.count}</span>
              </li>
            ))}
            {value.distrito && (
              <li>
                <button
                  onClick={() => set({ distrito: undefined })}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Limpiar distrito
                </button>
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Superficie (client-side filter sobre canchas embebidas) */}
      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Superficie
        </p>
        {loadingSuperficies ? (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Spinner size="sm" /> Cargando…
          </div>
        ) : (
          <ul className="space-y-1.5">
            {(superficies ?? []).map((s) => (
              <li key={s.id}>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={value.superficies.includes(s.codigo)}
                    onChange={() => toggleSuperficie(s.codigo)}
                    className="accent-primary"
                  />
                  {s.nombre}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
