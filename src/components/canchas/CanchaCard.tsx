'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CanchaSVG } from '@/components/public/CanchaSVG'
import { formatCurrency } from '@/lib/utils'
import type { Cancha, EstadoCancha } from '@/types'

interface Props {
  cancha: Cancha
  onEdit?: (c: Cancha) => void
  onDelete?: (c: Cancha) => void
}

const estadoBadge: Record<EstadoCancha, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  ACTIVA: { label: 'Activa', variant: 'success' },
  INACTIVA: { label: 'Inactiva', variant: 'danger' },
  MANTENIMIENTO: { label: 'Mantenimiento', variant: 'warning' },
}

export function CanchaCardDashboard({ cancha, onEdit, onDelete }: Props) {
  const estado = estadoBadge[cancha.estado]
  return (
    <Card className="flex flex-col gap-4 p-0 overflow-hidden">
      <CanchaSVG deporte={cancha.deporte} superficie={cancha.superficie} />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-dark">{cancha.nombre}</h3>
            <p className="text-xs text-gray-500">
              {cancha.deporte} · {cancha.superficie} · {cancha.capacidadJugadores}{' '}
              jugadores
            </p>
          </div>
          <Badge variant={estado.variant}>{estado.label}</Badge>
        </div>
        <p className="text-sm font-semibold text-primary">
          {formatCurrency(cancha.precioPorHora)} / hora
        </p>
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Pencil size={14} />}
            onClick={() => onEdit?.(cancha)}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => onDelete?.(cancha)}
            className="text-red-600 hover:bg-red-50"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  )
}
