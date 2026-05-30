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
  { value: 'NO_SHOW', label: 'No asistieron' },
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
  NO_SHOW: { label: 'No asistió', variant: 'danger' },
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Devuelve el monto a mostrar para una reserva.
 *
 *  - Si existen pagos → devuelve la suma como `cobrado`.
 *  - Si no hay pagos pero la cancha tiene tarifas (override o heredadas del
 *    tipoCancha), calcula el monto estimado: duración (horas) × tarifa
 *    cuya franja horaria cubra `horaInicio` (fallback: la primera tarifa).
 *  - Si no hay tarifas todavía, devuelve 0 sin estimar.
 */
function montoReserva(r: Reserva): { monto: number; estimado: boolean } {
  const totalPagado =
    r.pagos?.reduce((acc, p) => acc + Number(p.monto ?? 0), 0) ?? 0
  if (totalPagado > 0) return { monto: totalPagado, estimado: false }

  const inicio = new Date(r.fechaInicio)
  const fin = new Date(r.fechaFin)
  const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60)
  if (horas <= 0) return { monto: 0, estimado: false }

  const tarifas = [
    ...(r.cancha?.tarifas ?? []),
    ...(r.cancha?.tipoCancha?.tarifas ?? []),
  ]
  if (tarifas.length === 0) return { monto: 0, estimado: false }

  const hh = inicio.toTimeString().slice(0, 5) // "19:00"
  const aplicable =
    tarifas.find((t) => hh >= t.horaInicio && hh < t.horaFin) ?? tarifas[0]
  const monto = horas * Number(aplicable.precioHora)
  return { monto, estimado: true }
}

interface TablaReservasProps {
  reservas: Reserva[]
  /** Si se pasa, hacer click en una fila (fuera de los botones) abre el detalle */
  onVerDetalle?: (r: Reserva) => void
}

export function TablaReservas({ reservas, onVerDetalle }: TablaReservasProps) {
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
                const { monto, estimado } = montoReserva(r)
                return (
                  <tr
                    key={r.id}
                    onClick={() => onVerDetalle?.(r)}
                    className={cn(
                      'border-t border-gray-100 hover:bg-gray-50',
                      onVerDetalle && 'cursor-pointer',
                    )}
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
                    <td className="px-5 py-3 font-semibold">
                      {monto > 0 ? (
                        <span
                          className={cn(
                            'inline-flex items-baseline gap-1',
                            estimado ? 'text-gray-700' : 'text-primary',
                          )}
                          title={
                            estimado
                              ? 'Monto estimado a partir de la tarifa de la cancha. Aún no hay pago registrado.'
                              : 'Monto cobrado según pagos confirmados.'
                          }
                        >
                          {formatCurrency(monto)}
                          {estimado && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                              est.
                            </span>
                          )}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={e.variant}>{e.label}</Badge>
                    </td>
                    <td
                      className="px-5 py-3"
                      onClick={(ev) => ev.stopPropagation()}
                    >
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
                          r.estado !== 'COMPLETADA' &&
                          r.estado !== 'NO_SHOW' && (
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
