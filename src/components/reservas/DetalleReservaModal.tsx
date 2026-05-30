'use client'

import { useState } from 'react'
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Goal,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  PlayCircle,
  QrCode,
  RotateCcw,
  Trash2,
  UserX,
  X,
} from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CodigoQrCard } from './CodigoQrCard'
import { PagoReservaForm } from './PagoReservaForm'
import { ReservaForm } from './ReservaForm'
import {
  useCambiarEstadoReserva,
  useCancelarReserva,
  useCheckInReserva,
} from '@/hooks/reservas/useReservasMutations'
import {
  useConfirmarPagoReserva,
  useDevolverPagoReserva,
  useEliminarPagoReserva,
} from '@/hooks/reservas/usePagosReserva'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import { buildWhatsAppLink, formatCurrency, formatDate } from '@/lib/utils'
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
  NO_SHOW: { label: 'No asistió', variant: 'danger' },
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
  const confirmarPago = useConfirmarPagoReserva()
  const devolverPago = useDevolverPagoReserva()
  const eliminarPago = useEliminarPagoReserva()
  // Para el modo edición de la reserva necesitamos la lista de canchas del
  // local (por si el operador quiere moverla a otra cancha del mismo local).
  const { data: canchasLocal } = useCanchasByLocal(
    reserva?.cancha?.localId ?? undefined,
  )

  const [confirmCancelarOpen, setConfirmCancelarOpen] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [pagoOpen, setPagoOpen] = useState(false)
  const [editarOpen, setEditarOpen] = useState(false)
  const [pagoEditando, setPagoEditando] = useState<PagoReserva | null>(null)
  const [pagoAEliminar, setPagoAEliminar] = useState<PagoReserva | null>(null)

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

  // Enlace de WhatsApp al cliente con un mensaje sobre esta reserva ya armado,
  // para confirmar, recordar o coordinar sin tener que escribir todo a mano.
  const mensajeWhatsApp = cliente
    ? `Hola ${cliente.nombre}, te escribo por tu reserva en ${reserva.cancha?.nombre ?? 'la cancha'} el ${formatDate(reserva.fechaInicio)} de ${formatHora(reserva.fechaInicio)} a ${formatHora(reserva.fechaFin)}.`
    : ''
  const whatsAppLink = buildWhatsAppLink(cliente?.telefono, mensajeWhatsApp)

  const puedeConfirmar = reserva.estado === 'PENDIENTE'
  const puedeIniciarPartido = reserva.estado === 'CONFIRMADA'
  const puedeCompletar = reserva.estado === 'EN_CURSO'
  // El cliente confirmado (o ya en curso) que no se presentó se marca como
  // "no asistió" (NO_SHOW), estado terminal distinto de cancelado.
  const puedeNoShow =
    reserva.estado === 'CONFIRMADA' || reserva.estado === 'EN_CURSO'
  const puedeCancelar =
    reserva.estado !== 'COMPLETADA' &&
    reserva.estado !== 'CANCELADA' &&
    reserva.estado !== 'NO_SHOW'
  // Editar solo aplica antes de que el partido empiece. Una vez EN_CURSO,
  // COMPLETADA o CANCELADA, el flujo correcto es cancelar+rehacer.
  const puedeEditar =
    reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'
  // El operador puede registrar pagos en cualquier momento mientras la reserva
  // siga viva. Antes dependía de saldo > 0, pero si la cancha no tiene tarifa
  // configurada el saldo era 0 y el botón desaparecía — quedaba sin forma de
  // anotar un adelanto.
  const puedePago =
    reserva.estado !== 'CANCELADA' && reserva.estado !== 'NO_SHOW'

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
              {puedeIniciarPartido && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<PlayCircle size={14} />}
                  loading={checkIn.isPending}
                  onClick={() => checkIn.mutate(reserva.id)}
                >
                  Iniciar partido
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
                  Terminar partido
                </Button>
              )}
              {puedeEditar && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Pencil size={14} />}
                  onClick={() => setEditarOpen(true)}
                >
                  Editar
                </Button>
              )}
              {puedeNoShow && (
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<UserX size={14} />}
                  loading={
                    cambiarEstado.isPending &&
                    cambiarEstado.variables?.estado === 'NO_SHOW'
                  }
                  onClick={() =>
                    cambiarEstado.mutate({
                      id: reserva.id,
                      estado: 'NO_SHOW',
                    })
                  }
                >
                  Marcar como no asistió
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
                  {whatsAppLink && (
                    <a
                      href={whatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-success-700 hover:text-success-600"
                    >
                      <MessageCircle size={11} /> WhatsApp
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
                  {pagado > 0 ? 'Registrar otro pago' : 'Registrar pago'}
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
                    <div className="min-w-0">
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
                    <div className="flex items-center gap-2">
                      <Badge variant={ESTADO_PAGO_VARIANT[p.estado]} size="sm">
                        {p.estado}
                      </Badge>
                      {p.estado === 'PENDIENTE' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Check size={14} />}
                            loading={
                              confirmarPago.isPending &&
                              confirmarPago.variables?.id === p.id
                            }
                            onClick={() =>
                              confirmarPago.mutate({ id: p.id })
                            }
                            className="text-success-700 hover:bg-success-50"
                            title="Marcar como pagado"
                          >
                            Pagado
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Pencil size={14} />}
                            onClick={() => setPagoEditando(p)}
                            title="Editar pago"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            leftIcon={<Trash2 size={14} />}
                            onClick={() => setPagoAEliminar(p)}
                            className="text-red-600 hover:bg-red-50"
                            title="Eliminar pago"
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
                      {p.estado === 'PAGADO' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<RotateCcw size={14} />}
                          loading={
                            devolverPago.isPending &&
                            devolverPago.variables === p.id
                          }
                          onClick={() => devolverPago.mutate(p.id)}
                          className="text-warning-700 hover:bg-warning/10"
                          title="Devolver el pago al cliente"
                        >
                          Devolver
                        </Button>
                      )}
                    </div>
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
              Ver código QR
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR */}
      <Modal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Código QR del cliente"
        description="Escanéalo cuando el cliente llegue a la cancha para iniciar el partido."
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
        description={
          estimado > 0
            ? `Saldo pendiente: ${formatCurrency(saldo)}`
            : 'Anota cuánto te pagó el cliente y por qué medio. Puede ser un adelanto, una seña o el pago completo.'
        }
        size="lg"
      >
        <PagoReservaForm
          reservaId={reserva.id}
          montoSugerido={saldo > 0 ? saldo : undefined}
          total={estimado > 0 ? estimado : undefined}
          pagado={pagado}
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

      {/* Editar reserva */}
      <Modal
        isOpen={editarOpen}
        onClose={() => setEditarOpen(false)}
        title="Editar reserva"
        description="Cambia la cancha, fecha, hora o notas. El cliente y el estado se manejan desde el detalle."
        size="lg"
      >
        <ReservaForm
          reserva={reserva}
          canchas={canchasLocal ?? []}
          onSuccess={() => setEditarOpen(false)}
          onCancel={() => setEditarOpen(false)}
        />
      </Modal>

      {/* Editar pago */}
      <Modal
        isOpen={!!pagoEditando}
        onClose={() => setPagoEditando(null)}
        title="Editar pago"
        description="Corrige el monto, método o referencia. Solo aplica mientras el pago siga pendiente."
        size="lg"
      >
        {pagoEditando && (
          <PagoReservaForm
            reservaId={reserva.id}
            pago={pagoEditando}
            total={estimado > 0 ? estimado : undefined}
            pagado={pagado}
            onSuccess={() => setPagoEditando(null)}
            onCancel={() => setPagoEditando(null)}
          />
        )}
      </Modal>

      {/* Confirmar eliminar pago */}
      <ConfirmModal
        isOpen={!!pagoAEliminar}
        title="Eliminar pago"
        description={
          pagoAEliminar
            ? `¿Eliminar el pago de ${formatCurrency(Number(pagoAEliminar.monto))} (${fmtMetodo(pagoAEliminar.metodoPago)})? Solo se borran pagos pendientes; los confirmados quedan en el historial.`
            : ''
        }
        variant="danger"
        confirmLabel="Sí, eliminar"
        loading={eliminarPago.isPending}
        onConfirm={async () => {
          if (!pagoAEliminar) return
          await eliminarPago.mutateAsync(pagoAEliminar.id)
          setPagoAEliminar(null)
        }}
        onCancel={() => setPagoAEliminar(null)}
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
