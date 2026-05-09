'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MapPin, CalendarDays, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const ciudades = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura']
const deportes = [
  { value: 'FUTBOL', label: 'Fútbol' },
  { value: 'VOLEY', label: 'Vóley' },
  { value: 'BASKET', label: 'Básquet' },
  { value: 'TENIS', label: 'Tenis' },
  { value: 'PADEL', label: 'Pádel' },
]

export function HeroSearch() {
  const router = useRouter()
  const [ciudad, setCiudad] = useState('Lima')
  const [deporte, setDeporte] = useState('FUTBOL')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams({ ciudad, deporte, fecha })
    router.push(`/buscar?${params.toString()}`)
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid w-full max-w-4xl grid-cols-1 gap-2 rounded-2xl bg-white p-2 shadow-2xl sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_auto]"
    >
      <label className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-gray-50">
        <MapPin size={18} className="shrink-0 text-primary" />
        <div className="flex flex-1 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Ciudad
          </span>
          <select
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-dark focus:outline-none"
          >
            {ciudades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-gray-50">
        <span className="shrink-0 text-lg">⚽</span>
        <div className="flex flex-1 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Deporte
          </span>
          <select
            value={deporte}
            onChange={(e) => setDeporte(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-dark focus:outline-none"
          >
            {deportes.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="flex items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-gray-50 sm:col-span-2 md:col-span-1">
        <CalendarDays size={18} className="shrink-0 text-primary" />
        <div className="flex flex-1 flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Fecha
          </span>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-dark focus:outline-none"
          />
        </div>
      </label>

      <Button
        type="submit"
        variant="warning"
        size="lg"
        className="sm:col-span-2 md:col-span-1"
        leftIcon={<Search size={18} />}
      >
        Buscar cancha
      </Button>
    </form>
  )
}
