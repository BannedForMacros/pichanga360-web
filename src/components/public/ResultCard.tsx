import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CanchaSVG } from '@/components/public/CanchaSVG'
import { formatCurrency } from '@/lib/utils'
import type { DeporteCodigo, SuperficieCodigo } from '@/types'

export interface ResultCardData {
  id: string
  nombre: string
  deporte: DeporteCodigo
  superficie: SuperficieCodigo
  distrito: string
  direccion: string
  precioPorHora: number
  rating?: number
  totalReseñas?: number
  caracteristicas: string[]
  horariosLibres: string[]
  distancia: number
}

const deporteLabel: Record<DeporteCodigo, string> = {
  FUTBOL: 'Fútbol',
  VOLEY: 'Vóley',
  BASKET: 'Básquet',
  TENIS: 'Tenis',
  PADEL: 'Pádel',
  OTRO: 'Otro',
}

export function ResultCard({ cancha }: { cancha: ResultCardData }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
        <div className="relative aspect-[16/10] sm:aspect-auto">
          <CanchaSVG
            deporte={cancha.deporte}
            superficie={cancha.superficie}
            className="h-full w-full"
          />
          <Badge
            variant="warning"
            className="absolute left-3 top-3 bg-warning text-white shadow-sm"
          >
            {deporteLabel[cancha.deporte]}
          </Badge>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-dark">
                {cancha.nombre}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} className="text-gray-400" />
                <span className="truncate">
                  {cancha.direccion} · {cancha.distrito}
                </span>
                <span className="font-semibold text-primary">
                  · {cancha.distancia} km
                </span>
              </p>
            </div>
            {cancha.rating != null && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-50 px-2 py-1 text-xs font-bold text-warning-600">
                <Star size={12} className="fill-warning text-warning" />
                {cancha.rating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-600">
            {cancha.caracteristicas.join(' · ')}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {cancha.horariosLibres.map((h) => (
              <span
                key={h}
                className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-600"
              >
                {h}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-2 border-t border-gray-100 pt-3">
            <div>
              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                Desde
              </span>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(cancha.precioPorHora)}
                <span className="ml-1 text-xs font-medium text-gray-500">
                  / hora
                </span>
              </p>
            </div>
            <Link href={`/cancha/${cancha.id}`}>
              <Button size="sm">Ver cancha →</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
