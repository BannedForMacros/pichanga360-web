'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCurrency } from '@/lib/utils'

export interface CeldaReserva {
  estado: 'CONFIRMADO' | 'PENDIENTE' | 'LIBRE'
  cliente?: string
  monto?: number
}

export interface FilaCancha {
  canchaId: string
  canchaNombre: string
  celdas: CeldaReserva[]
}

interface CalendarioSemanalProps {
  semanaLabel?: string
  dias?: string[]
  filas: FilaCancha[]
}

const estadoStyles: Record<CeldaReserva['estado'], string> = {
  CONFIRMADO: 'bg-success-50 text-success-600 border-success-50',
  PENDIENTE: 'bg-warning-50 text-warning-600 border-warning-50',
  LIBRE: 'bg-gray-50 text-gray-400 border-gray-100 hover:border-primary',
}

export function CalendarioSemanal({
  semanaLabel = '21 — 27 abril 2026',
  dias = ['Lun 21', 'Mar 22', 'Mié 23', 'Jue 24', 'Vie 25', 'Sáb 26', 'Dom 27'],
  filas,
}: CalendarioSemanalProps) {
  const [open, setOpen] = useState(false)
  const [detalle, setDetalle] = useState<{
    cancha: string
    dia: string
    celda: CeldaReserva
  } | null>(null)

  const onCelda = (cancha: string, dia: string, celda: CeldaReserva) => {
    setDetalle({ cancha, dia, celda })
    setOpen(true)
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-dark">Calendario semanal</h3>
          <p className="text-xs text-gray-500">{semanaLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            aria-label="Semana anterior"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Semana siguiente"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[820px] grid-cols-[180px_repeat(7,1fr)] text-xs">
          <div className="bg-gray-50 px-3 py-2 font-semibold text-gray-500">
            Cancha
          </div>
          {dias.map((d) => (
            <div
              key={d}
              className="bg-gray-50 px-2 py-2 text-center font-semibold text-gray-500"
            >
              {d}
            </div>
          ))}
          {filas.map((fila) => (
            <div key={fila.canchaId} className="contents">
              <div className="border-t border-gray-100 px-3 py-3 font-semibold text-dark">
                {fila.canchaNombre}
              </div>
              {fila.celdas.slice(0, 7).map((celda, idx) => (
                <button
                  key={`${fila.canchaId}-${idx}`}
                  onClick={() => onCelda(fila.canchaNombre, dias[idx], celda)}
                  className={cn(
                    'flex h-14 items-center justify-center border border-l border-t border-gray-100 text-[11px] font-semibold uppercase tracking-wide transition',
                    estadoStyles[celda.estado]
                  )}
                >
                  {celda.estado === 'LIBRE' ? (
                    <Plus size={14} />
                  ) : (
                    <span className="px-1 text-center leading-tight">
                      {celda.estado === 'CONFIRMADO' ? '✓ ' : '⏳ '}
                      {celda.cliente?.split(' ')[0] ?? celda.estado}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Detalle de la celda"
        description={detalle ? `${detalle.cancha} · ${detalle.dia}` : ''}
      >
        {detalle && (
          <div className="space-y-3">
            <Badge
              variant={
                detalle.celda.estado === 'CONFIRMADO'
                  ? 'success'
                  : detalle.celda.estado === 'PENDIENTE'
                    ? 'warning'
                    : 'neutral'
              }
            >
              {detalle.celda.estado}
            </Badge>
            {detalle.celda.cliente && (
              <p className="text-sm text-dark">
                <span className="font-semibold">Cliente:</span>{' '}
                {detalle.celda.cliente}
              </p>
            )}
            {detalle.celda.monto != null && (
              <p className="text-sm text-dark">
                <span className="font-semibold">Monto:</span>{' '}
                {formatCurrency(detalle.celda.monto)}
              </p>
            )}
            {detalle.celda.estado === 'LIBRE' && (
              <p className="text-sm text-gray-600">
                Bloque libre — listo para crear una reserva.
              </p>
            )}
          </div>
        )}
      </Modal>
    </Card>
  )
}
