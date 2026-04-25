'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useCancelarReserva } from '@/hooks/reservas/useReservasMutations'
import { cn, formatCurrency } from '@/lib/utils'
import type { EstadoReserva } from '@/types'

export interface ReservaRow {
  id: string
  clienteNombre: string
  clienteEmail: string
  cancha: string
  fecha: string
  horario: string
  monto: number
  estado: EstadoReserva
}

const tabs: { value: 'TODAS' | EstadoReserva; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
]

const estadoBadge: Record<
  EstadoReserva,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info' }
> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'success' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
  COMPLETADA: { label: 'Completada', variant: 'info' },
  NO_ASISTIO: { label: 'No asistió', variant: 'neutral' },
}

export function TablaReservas({ reservas }: { reservas: ReservaRow[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['value']>('TODAS')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<ReservaRow | null>(null)

  const cancelar = useCancelarReserva()

  const data = useMemo(() => {
    if (tab === 'TODAS') return reservas
    return reservas.filter((r) => r.estado === tab)
  }, [reservas, tab])

  const onConfirmDelete = async () => {
    if (!target) return
    await cancelar.mutateAsync(target.id)
    setConfirmOpen(false)
    setTarget(null)
  }

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-dark">Reservas recientes</h3>
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                tab === t.value
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Cancha</th>
              <th className="px-5 py-3">Horario</th>
              <th className="px-5 py-3">Monto</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                  No hay reservas en esta vista.
                </td>
              </tr>
            ) : (
              data.map((r) => {
                const e = estadoBadge[r.estado]
                return (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.clienteNombre} size="sm" />
                        <div>
                          <p className="font-semibold text-dark">{r.clienteNombre}</p>
                          <p className="text-xs text-gray-500">{r.clienteEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{r.cancha}</td>
                    <td className="px-5 py-3 text-gray-700">
                      <p>{r.fecha}</p>
                      <p className="text-xs text-gray-500">{r.horario}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-primary">
                      {formatCurrency(r.monto)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={e.variant}>{e.label}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => {
                          setTarget(r)
                          setConfirmOpen(true)
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Cancelar
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Cancelar reserva"
        description={
          target
            ? `¿Estás seguro de cancelar la reserva de ${target.clienteNombre} en ${target.cancha}? Esta acción no se puede deshacer.`
            : ''
        }
        variant="danger"
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        loading={cancelar.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setTarget(null)
        }}
      />
    </Card>
  )
}
