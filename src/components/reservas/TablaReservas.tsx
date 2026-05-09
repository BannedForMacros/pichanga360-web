'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import {
  useCancelarReserva,
  useCambiarEstadoReserva,
} from '@/hooks/reservas/useReservasMutations'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { EstadoReserva, Reserva } from '@/types'

const tabs: { value: 'TODAS' | EstadoReserva; label: string }[] = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'COMPLETADA', label: 'Completadas' },
]

const estadoBadge: Record<
  EstadoReserva,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'primary' }
> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'success' },
  EN_CURSO: { label: 'En curso', variant: 'primary' },
  COMPLETADA: { label: 'Completada', variant: 'info' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function montoReserva(r: Reserva): number {
  if (!r.pagos?.length) return 0
  return r.pagos.reduce((acc, p) => acc + Number(p.monto ?? 0), 0)
}

export function TablaReservas({ reservas }: { reservas: Reserva[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]['value']>('TODAS')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Reserva | null>(null)

  const cancelar = useCancelarReserva()
  const cambiarEstado = useCambiarEstadoReserva()

  const data = useMemo(() => {
    if (tab === 'TODAS') return reservas
    return reservas.filter((r) => r.estado === tab)
  }, [reservas, tab])

  const onConfirmCancel = async () => {
    if (!target) return
    await cancelar.mutateAsync({ id: target.id })
    setConfirmOpen(false)
    setTarget(null)
  }

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-dark">Reservas</h3>
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-gray-100 p-1">
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
        <table className="w-full min-w-[820px] text-left text-sm">
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
                const cliente = r.cliente
                  ? `${r.cliente.nombre} ${r.cliente.apellido}`
                  : 'Cliente desconocido'
                const monto = montoReserva(r)
                return (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={cliente} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-dark">
                            {cliente}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {r.cliente?.email ?? '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {r.cancha?.nombre ?? r.canchaId}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      <p>{formatDate(r.fechaInicio)}</p>
                      <p className="text-xs text-gray-500">
                        {formatHora(r.fechaInicio)} — {formatHora(r.fechaFin)}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-primary">
                      {monto > 0 ? formatCurrency(monto) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={e.variant}>{e.label}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {r.estado === 'PENDIENTE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Check size={14} />}
                            onClick={() =>
                              cambiarEstado.mutate({
                                id: r.id,
                                estado: 'CONFIRMADA',
                              })
                            }
                            className="text-success-600 hover:bg-success-50"
                          >
                            Confirmar
                          </Button>
                        )}
                        {r.estado !== 'CANCELADA' &&
                          r.estado !== 'COMPLETADA' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<X size={14} />}
                              onClick={() => {
                                setTarget(r)
                                setConfirmOpen(true)
                              }}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Cancelar
                            </Button>
                          )}
                      </div>
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
            ? `¿Estás seguro de cancelar la reserva de ${
                target.cliente
                  ? `${target.cliente.nombre} ${target.cliente.apellido}`
                  : 'este cliente'
              }? Esta acción no se puede deshacer.`
            : ''
        }
        variant="danger"
        confirmLabel="Sí, cancelar"
        cancelLabel="Volver"
        loading={cancelar.isPending}
        onConfirm={onConfirmCancel}
        onCancel={() => {
          setConfirmOpen(false)
          setTarget(null)
        }}
      />
    </Card>
  )
}
