import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { DeporteCodigo, SuperficieCodigo } from '@/types'
import { CanchaSVG } from './CanchaSVG'

export interface CanchaCardData {
  id: string
  nombre: string
  deporte: DeporteCodigo
  superficie: SuperficieCodigo
  distrito: string
  precioPorHora: number
  rating?: number
  totalReseñas?: number
  disponibilidad?: string
}

const deporteLabel: Record<DeporteCodigo, string> = {
  FUTBOL: 'Fútbol',
  VOLEY: 'Vóley',
  BASKET: 'Básquet',
  TENIS: 'Tenis',
  PADEL: 'Pádel',
  OTRO: 'Otro',
}

export function CanchaCard({ cancha }: { cancha: CanchaCardData }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <CanchaSVG deporte={cancha.deporte} superficie={cancha.superficie} />
        <Badge
          variant="warning"
          size="md"
          className="absolute left-3 top-3 shadow-sm"
        >
          {deporteLabel[cancha.deporte]}
        </Badge>
        {cancha.rating != null && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-dark shadow-sm">
            <Star size={12} className="fill-warning text-warning" />
            {cancha.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-dark">{cancha.nombre}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={14} className="text-gray-400" />
          {cancha.distrito}
        </p>
        {cancha.disponibilidad && (
          <Badge variant="success" className="mt-3 self-start">
            {cancha.disponibilidad}
          </Badge>
        )}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="text-xs text-gray-500">Desde</span>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(cancha.precioPorHora)}
              <span className="ml-1 text-xs font-medium text-gray-500">
                / hora
              </span>
            </p>
          </div>
          <Link href={`/cancha/${cancha.id}`}>
            <Button size="sm">Reservar →</Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
