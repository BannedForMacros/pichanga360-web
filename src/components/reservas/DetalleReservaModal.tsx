'use client'

import { useState } from 'react'
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Goal,
  Mail,
  Phone,
  PlayCircle,
  QrCode,
  RefreshCcw,
  Undo2,
  User,
  X,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CodigoQrCard } from './CodigoQrCard'
import { PagoReservaForm } from './PagoReservaForm'
import {
  useCambiarEstadoReserva,
  useCancelarReserva,
  useCheckInReserva,
} from '@/hooks/reservas/useReservasMutations'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { EstadoReserva, PagoReserva, Reserva } from '@/types'

const estadoBadge: Record<
  EstadoReserva,
  {
    label: string
    variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'primary'
  }
> = {
  PENDIENTE: { label: 'Pendiente', variant: 'warning' },
  CONFIRMADA: { label: 'Confirmada', variant: 'success' },
  EN_CURSO: { label: 'En curso', variant: 'primary' },
  COMPLETADA: { label: 'Completada', variant: 'info' },
  CANCELADA: { label: 'Cancelada', variant: 'danger' },
}

const ESTADO_PAGO_VARIANT: Record<
  PagoReserva['estado'],
  'success' | 'warning' | 'neutral'
> = {
  PAGADO: 'success',
  PENDIENTE: 'warning',
  DEVUELTO: 'neutral',
}

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtMetodo(m: string) {
  return m.charAt(0) + m.slice(1).toLowerCase()
}

function calcularMontos(r: Reserva) {
  const pagado =
    r.pagos?.reduce(
      (acc, p) =>
        p.estado === 'PAGADO' || p.estado === 'PENDIENTE'
          ? acc + Number(p.monto ?? 0)
          : acc,
      0,
    ) ?? 0

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

  return {
    pagado,
    estimado,
    saldo: Math.max(0, estimado - pagado),
  }
}

interface Props {
  reserva: Reserva | null
  onClose: () => void
}

export function DetalleReservaModal({ reserva, onClose }: Props) {
  const cancelar = useCancelarReserva()
  const cambiarEstado = useCambiarEstadoReserva()
  const checkIn = useCheckInReserva()

  const [confirmCancelarOpen, setConfirmCancelarOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [pagoOpen, setPagoOpen] = useState(false)

  if (!reserva) {
    return (
      <Modal isOpen={false} onClose={onClose} title="">
        <span />
      </Modal>
    )
  }

  const e = estadoBadge[reserva.estado]
  const cliente = reserva.cliente
  const nombreCliente = cliente
    ? `${cliente.nombre} ${cliente.apellido ?? ''}`.trim()
    : 'Cliente desconocido'
  const { pagado, estimado, saldo } = calcularMontos(reserva)

  const puedeConfirmar = reserva.estado === 'PENDIENTE'
  const puedeCheckIn = reserva.estado === 'CONFIRMADA'
  const puedeCompletar = reserva.estado === 'EN_CURSO'
  const puedeCancelar =
    reserva.estado !== 'COMPLETADA' && reserva.estado !== 'CANCELADA'
  const puedePago = saldo > 0 && reserva.estado !== 'CANCELADA'

  return (
    <>
      <Modal
        isOpen={!!reserva}
        onClose={onClose}
        title="Detalle de reserva"
        description={`Código #${reserva.codigoQr.slice(-6)}`}
        size="lg"
      >
        <div className="space-y-5">
          {/* Estado + acciones rápidas arriba */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant={e.variant} size="md">
              {e.label}
            </Badge>
            <div className="flex flex-wrap gap-2">
              {puedeConfirmar && (
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={<Check size={14} />}
                  loading={
                    cambiarEstado.isPending &&
                    cambiarEstado.variables?.estado === 'CONFIRMADA'
                  }
                  onClick={() =>
                    cambiarEstado.mutate({
                      id: reserva.id,
                      estado: 'CONFIRMADA',
                    })
                  }
                >
                  Confirmar
                </Button>
              )}
              {puedeCheckIn && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<PlayCircle size={14} />}
                  loading={checkIn.isPending}
                  onClick={() => checkIn.mutate(reserva.id)}
                >
                  Check-in
                </Button>
              )}
              {puedeCompletar && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Check size={14} />}
                  loading={
                    cambiarEstado.isPending &&
                    cambiarEstado.variables?.estado === 'COMPLETADA'
                  }
                  onClick={() =>
                    cambiarEstado.mutate({
                      id: reserva.id,
                      estado: 'COMPLETADA',
                    })
                  }
                >
                  Completar
                </Button>
              )}
              {puedeCancelar && (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<X size={14} />}
                  onClick={() => setConfirmCancelarOpen(true)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Cliente */}
          <section className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={nombreCliente}
                src={cliente?.avatarUrl ?? undefined}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-dark">
                  {nombreCliente}
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                  {cliente?.telefono && (
                    <a
                      href={`tel:${cliente.telefono}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Phone size={11} /> {cliente.telefono}
                    </a>
                  )}
                  {cliente?.email &&
                    !cliente.email.includes('walkin.pichanga360') && (
                      <a
                        href={`mailto:${cliente.email}`}
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        <Mail size={11} /> {cliente.email}
                      </a>
                    )}
                  {cliente?.email?.includes('walkin.pichanga360') && (
                    <span className="inline-flex items-center gap-1 text-gray-400">
                      <User size={11} /> Walk-in (sin email)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Cancha + horario */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Tile
              icon={<Goal size={14} />}
              label="Cancha"
              value={reserva.cancha?.nombre ?? '—'}
            />
            <Tile
              icon={<Calendar size={14} />}
              label="Fecha"
              value={formatDate(reserva.fechaInicio)}
            />
            <Tile
              icon={<Clock size={14} />}
              label="Horario"
              value={`${formatHora(reserva.fechaInicio)} – ${formatHora(reserva.fechaFin)}`}
            />
          </section>

          {/* Pagos */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Pagos
                </p>
                <p className="mt-1 text-base font-bold text-dark">
                  {formatCurrency(pagado)}{' '}
                  {estimado > 0 && (
                    <span className="text-xs font-normal text-gray-500">
                      de {formatCurrency(estimado)} estimado
                    </span>
                  )}
                </p>
                {saldo > 0 && (
                  <p className="mt-0.5 text-xs font-semibold text-warning-700">
                    Saldo pendiente: {formatCurrency(saldo)}
                  </p>
                )}
              </div>
              {puedePago && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<CreditCard size={14} />}
                  onClick={() => setPagoOpen(true)}
                >
                  Registrar pago
                </Button>
              )}
            </div>

            {reserva.pagos && reserva.pagos.length > 0 && (
              <ul className="mt-3 divide-y divide-gray-100">
                {reserva.pagos.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-dark">
                        {formatCurrency(Number(p.monto))}
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          {fmtMetodo(p.metodoPago)}
                        </span>
                      </p>
                      {p.referencia && (
                        <p className="text-xs text-gray-500">
                          Ref: {p.referencia}
                        </p>
                      )}
                    </div>
                    <Badge variant={ESTADO_PAGO_VARIANT[p.estado]} size="sm">
                      {p.estado}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Notas */}
          {reserva.notas && (
            <section className="rounded-2xl bg-primary-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                Notas
              </p>
              <p className="mt-1 text-sm text-primary-700">{reserva.notas}</p>
            </section>
          )}

          {/* Accesos rápidos */}
          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<QrCode size={14} />}
              onClick={() => setQrOpen(true)}
            >
              Ver QR de check-in
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR */}
      <Modal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Código QR del cliente"
        description="Escanea este código al recibir al cliente para hacer check-in."
        size="md"
      >
        <CodigoQrCard
          codigo={reserva.codigoQr}
          contexto={`${reserva.cancha?.nombre ?? ''} · ${formatDate(reserva.fechaInicio)} · ${formatHora(reserva.fechaInicio)}`}
        />
      </Modal>

      {/* Registrar pago */}
      <Modal
        isOpen={pagoOpen}
        onClose={() => setPagoOpen(false)}
        title="Registrar pago"
        description={`Saldo pendiente: ${formatCurrency(saldo || estimado)}`}
        size="lg"
      >
        <PagoReservaForm
          reservaId={reserva.id}
          montoSugerido={saldo || estimado}
          onSuccess={() => setPagoOpen(false)}
          onCancel={() => setPagoOpen(false)}
        />
      </Modal>

      {/* Confirmar cancelación */}
      <ConfirmModal
        isOpen={confirmCancelarOpen}
        title="Cancelar reserva"
        description={`¿Cancelar la reserva de ${nombreCliente} del ${formatDate(reserva.fechaInicio)} (${formatHora(reserva.fechaInicio)})? Esta acción no se puede deshacer.`}
        variant="danger"
        confirmLabel="Sí, cancelar"
        loading={cancelar.isPending}
        onConfirm={async () => {
          await cancelar.mutateAsync({ id: reserva.id })
          setConfirmCancelarOpen(false)
          onClose()
        }}
        onCancel={() => setConfirmCancelarOpen(false)}
      />
    </>
  )
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {icon} {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-dark">{value}</p>
    </div>
  )
}
