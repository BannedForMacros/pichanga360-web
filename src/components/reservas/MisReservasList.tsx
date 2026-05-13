'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  QrCode,
  Star,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Modal } from '@/components/ui/Modal'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useCancelarReserva } from '@/hooks/reservas/useReservasMutations'
import { CodigoQrCard } from './CodigoQrCard'
import { PagoReservaForm } from './PagoReservaForm'
import { ResenaForm } from './ResenaForm'
import type { EstadoReserva, Reserva } from '@/types'

const estadoBadge: Record<
  EstadoReserva,
  {
    label: string
    variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'primary'
  }
> = {
  PENDIENTE: { label: 'Pendiente de confirmación', variant: 'warning' },
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

function calcularMonto(
  r: Reserva,
): { monto: number; estimado: boolean; pagado: number; saldo: number } {
  const pagado =
    r.pagos?.reduce((acc, p) => acc + Number(p.monto ?? 0), 0) ?? 0

  const inicio = new Date(r.fechaInicio)
  const fin = new Date(r.fechaFin)
  const horas = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60)

  const tarifas = [
    ...(r.cancha?.tarifas ?? []),
    ...(r.cancha?.tipoCancha?.tarifas ?? []),
  ]
  let estimado = 0
  if (tarifas.length > 0 && horas > 0) {
    const hh = inicio.toTimeString().slice(0, 5)
    const aplicable =
      tarifas.find((t) => hh >= t.horaInicio && hh < t.horaFin) ?? tarifas[0]
    estimado = horas * Number(aplicable.precioHora)
  }

  const monto = pagado > 0 ? pagado : estimado
  const saldo = Math.max(0, estimado - pagado)
  return { monto, estimado: pagado === 0 && estimado > 0, pagado, saldo }
}

interface Props {
  reservas: Reserva[]
}

export function MisReservasList({ reservas }: Props) {
  const cancelar = useCancelarReserva()

  const [reservaQr, setReservaQr] = useState<Reserva | null>(null)
  const [reservaPago, setReservaPago] = useState<Reserva | null>(null)
  const [reservaResena, setReservaResena] = useState<Reserva | null>(null)
  const [reservaCancelar, setReservaCancelar] = useState<Reserva | null>(null)

  if (reservas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-base font-semibold text-dark">
          Aún no tienes reservas
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Busca una cancha desde el botón "Buscar" y reserva en segundos.
        </p>
      </div>
    )
  }

  const reservasOrdenadas = [...reservas].sort((a, b) =>
    a.fechaInicio < b.fechaInicio ? 1 : -1,
  )

  const pagoSugerido = reservaPago ? calcularMonto(reservaPago) : null

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {reservasOrdenadas.map((r) => {
          const e = estadoBadge[r.estado]
          const { monto, estimado, pagado, saldo } = calcularMonto(r)
          const cancha = r.cancha
          const puedeCancelar =
            r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA'
          const puedePagar = saldo > 0 && r.estado !== 'CANCELADA'
          const puedeMostrarQR =
            r.estado === 'PENDIENTE' ||
            r.estado === 'CONFIRMADA' ||
            r.estado === 'EN_CURSO'
          const puedeReseñar = r.estado === 'COMPLETADA'

          return (
            <li key={r.id}>
              <Card className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-dark">
                      {cancha?.nombre ?? 'Cancha'}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} /> Reserva #{r.codigoQr.slice(-6)}
                    </p>
                  </div>
                  <Badge variant={e.variant}>{e.label}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="flex items-center gap-1 text-[11px] uppercase font-semibold text-gray-500">
                      <Calendar size={11} /> Fecha
                    </p>
                    <p className="mt-0.5 font-semibold text-dark">
                      {formatDate(r.fechaInicio)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-[11px] uppercase font-semibold text-gray-500">
                      <Clock size={11} /> Horario
                    </p>
                    <p className="mt-0.5 font-semibold text-dark">
                      {formatHora(r.fechaInicio)} – {formatHora(r.fechaFin)}
                    </p>
                  </div>
                </div>

                {monto > 0 && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {pagado > 0 ? 'Pagado' : 'Total estimado'}
                      </span>
                      <span
                        className={cn(
                          'font-bold',
                          estimado ? 'text-gray-700' : 'text-success-700',
                        )}
                      >
                        {formatCurrency(monto)}
                        {estimado && (
                          <span className="ml-1 text-[10px] uppercase text-gray-400">
                            est.
                          </span>
                        )}
                      </span>
                    </div>
                    {pagado > 0 && saldo > 0 && (
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                        <span>Saldo pendiente</span>
                        <span className="font-bold text-warning-700">
                          {formatCurrency(saldo)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {r.notas && (
                  <p className="rounded-lg bg-primary-50 px-3 py-2 text-xs text-primary-700">
                    📝 {r.notas}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap gap-2">
                  {puedeMostrarQR && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<QrCode size={14} />}
                      onClick={() => setReservaQr(r)}
                    >
                      Ver QR
                    </Button>
                  )}
                  {puedePagar && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CreditCard size={14} />}
                      onClick={() => setReservaPago(r)}
                    >
                      {pagado > 0 ? 'Pagar saldo' : 'Pagar'}
                    </Button>
                  )}
                  {puedeReseñar && (
                    <Button
                      size="sm"
                      variant="warning"
                      leftIcon={<Star size={14} />}
                      onClick={() => setReservaResena(r)}
                    >
                      Dejar reseña
                    </Button>
                  )}
                  {puedeCancelar && (
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<X size={14} />}
                      onClick={() => setReservaCancelar(r)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <Modal
        isOpen={!!reservaQr}
        onClose={() => setReservaQr(null)}
        title="Tu código QR"
        description="Muéstralo al llegar a la cancha. Con él te marcamos el inicio del partido."
        size="md"
      >
        {reservaQr && (
          <CodigoQrCard
            codigo={reservaQr.codigoQr}
            contexto={`${reservaQr.cancha?.nombre ?? 'Cancha'} · ${formatDate(reservaQr.fechaInicio)} · ${formatHora(reservaQr.fechaInicio)}`}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!reservaPago}
        onClose={() => setReservaPago(null)}
        title="Registrar pago de la reserva"
        description="Yape, Plin, transferencia o efectivo. El operador del local lo confirma."
        size="lg"
      >
        {reservaPago && (
          <PagoReservaForm
            reservaId={reservaPago.id}
            montoSugerido={pagoSugerido?.saldo || pagoSugerido?.monto}
            onSuccess={() => setReservaPago(null)}
            onCancel={() => setReservaPago(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!reservaResena}
        onClose={() => setReservaResena(null)}
        title="Cuéntanos cómo te fue"
        description="Tu opinión ayuda a otros jugadores y a que el local mejore."
        size="md"
      >
        {reservaResena && (
          <ResenaForm
            reservaId={reservaResena.id}
            onSuccess={() => setReservaResena(null)}
            onCancel={() => setReservaResena(null)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!reservaCancelar}
        title="Cancelar reserva"
        description={
          reservaCancelar
            ? `¿Cancelar la reserva del ${formatDate(reservaCancelar.fechaInicio)}? Esta acción no se puede deshacer.`
            : ''
        }
        variant="danger"
        confirmLabel="Sí, cancelar"
        loading={cancelar.isPending}
        onConfirm={async () => {
          if (!reservaCancelar) return
          await cancelar.mutateAsync({ id: reservaCancelar.id })
          setReservaCancelar(null)
        }}
        onCancel={() => setReservaCancelar(null)}
      />
    </>
  )
}
