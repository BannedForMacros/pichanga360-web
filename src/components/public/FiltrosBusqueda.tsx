'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const deportes = [
  { value: 'FUTBOL', label: 'Fútbol' },
  { value: 'VOLEY', label: 'Vóley' },
  { value: 'BASKET', label: 'Básquet' },
  { value: 'TENIS', label: 'Tenis' },
  { value: 'PADEL', label: 'Pádel' },
]

const distritos = [
  { value: 'San Isidro', count: 24 },
  { value: 'Miraflores', count: 18 },
  { value: 'Surco', count: 32 },
  { value: 'La Molina', count: 12 },
  { value: 'San Borja', count: 14 },
  { value: 'Barranco', count: 9 },
]

const horarios = ['Mañana', 'Tarde', 'Noche']

const superficies = [
  { value: 'GRASS', label: 'Grass natural' },
  { value: 'SINTETICO', label: 'Sintético' },
  { value: 'CEMENTO', label: 'Cemento' },
  { value: 'MADERA', label: 'Madera' },
]

export function FiltrosBusqueda() {
  const [deporte, setDeporte] = useState('FUTBOL')
  const [precio, setPrecio] = useState(120)
  const [distritosSeleccionados, setDistritosSeleccionados] = useState<string[]>([])
  const [horario, setHorario] = useState<string[]>([])
  const [superficiesSel, setSuperficiesSel] = useState<string[]>([])

  const toggle = (
    arr: string[],
    setter: (next: string[]) => void,
    val: string
  ) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 lg:sticky lg:top-20">
      <h3 className="mb-4 hidden text-sm font-semibold text-dark lg:block">Filtros</h3>

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Deporte
        </p>
        <div className="flex flex-wrap gap-1.5">
          {deportes.map((d) => (
            <button
              key={d.value}
              onClick={() => setDeporte(d.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                deporte === d.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Precio / hora
        </p>
        <input
          type="range"
          min={20}
          max={300}
          step={10}
          value={precio}
          onChange={(e) => setPrecio(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <p className="mt-1 text-xs text-gray-600">
          Hasta <span className="font-semibold text-dark">S/ {precio}</span>
        </p>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Distrito
        </p>
        <ul className="space-y-1.5">
          {distritos.map((d) => (
            <li key={d.value} className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  checked={distritosSeleccionados.includes(d.value)}
                  onChange={() =>
                    toggle(distritosSeleccionados, setDistritosSeleccionados, d.value)
                  }
                  className="accent-primary"
                />
                {d.value}
              </label>
              <span className="text-xs text-gray-500">{d.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Horario
        </p>
        <div className="flex flex-wrap gap-1.5">
          {horarios.map((h) => (
            <button
              key={h}
              onClick={() => toggle(horario, setHorario, h)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                horario.includes(h)
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary'
              )}
            >
              {h}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Superficie
        </p>
        <ul className="space-y-1.5">
          {superficies.map((s) => (
            <li key={s.value}>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={superficiesSel.includes(s.value)}
                  onChange={() =>
                    toggle(superficiesSel, setSuperficiesSel, s.value)
                  }
                  className="accent-primary"
                />
                {s.label}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
