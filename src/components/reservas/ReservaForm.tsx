'use client'

import { useMemo, useState } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  Hash,
  User as UserIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import { ClienteSelectorReserva } from './ClienteSelectorReserva'
import {
  combineDateTime,
  DURACION_LABEL,
  DURACIONES_MIN,
  horaFinFromDuracion,
  reservaSchema,
  type ReservaFormData,
} from '@/validators/reservas/reserva.schema'
import {
  useActualizarReserva,
  useCrearReserva,
} from '@/hooks/reservas/useReservasMutations'
import { useRegistrarPagoReserva } from '@/hooks/reservas/usePagosReserva'
import { useReservas } from '@/hooks/reservas/useReservas'
import { useHorariosByCancha } from '@/hooks/horarios/useHorarios'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import {
  METODOS_PAGO_RESERVA,
  METODO_PAGO_LABEL,
} from '@/validators/reservas/pago-reserva.schema'
import { cn } from '@/lib/utils'
import type { Cancha, DiaSemana, MetodoPago, Reserva, Usuario } from '@/types'

const DIA_SEMANA_BY_INDEX: DiaSemana[] = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
]

const DIA_SEMANA_LABEL: Record<DiaSemana, string> = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miércoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sábado',
  DOMINGO: 'domingo',
}

function diaSemanaDeFecha(fechaYmd: string): DiaSemana | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaYmd)) return null
  const [y, m, d] = fechaYmd.split('-').map((n) => parseInt(n, 10))
  return DIA_SEMANA_BY_INDEX[new Date(y, m - 1, d).getDay()]
}

type CanchaParaForm = Pick<Cancha, 'id' | 'nombre'> & {
  tarifas?: Cancha['tarifas']
  tipoCancha?: Cancha['tipoCancha']
}

interface ReservaFormProps {
  canchas?: CanchaParaForm[]
  defaultCanchaId?: string
  /** YYYY-MM-DD */
  defaultFecha?: string
  /** HH:mm */
  defaultHoraInicio?: string
  /**
   * Si viene, el form arranca en modo edición: pre-llena los campos con los
   * datos de la reserva existente y al guardar hace PATCH en vez de POST.
   * El cliente no se puede cambiar (cancelar + crear nueva si hace falta).
   */
  reserva?: Reserva
  onSuccess?: () => void
  onCancel?: () => void
}

function inicialesDesdeReserva(r: Reserva): {
  fecha: string
  horaInicio: string
  duracionMin: number
} {
  const ini = new Date(r.fechaInicio)
  const fin = new Date(r.fechaFin)
  const y = ini.getFullYear()
  const m = String(ini.getMonth() + 1).padStart(2, '0')
  const d = String(ini.getDate()).padStart(2, '0')
  const hh = String(ini.getHours()).padStart(2, '0')
  const mm = String(ini.getMinutes()).padStart(2, '0')
  return {
    fecha: `${y}-${m}-${d}`,
    horaInicio: `${hh}:${mm}`,
    duracionMin: Math.round((fin.getTime() - ini.getTime()) / 60000),
  }
}

function calcularTotalEstimado(
  cancha: CanchaParaForm | undefined,
  horaInicio: string,
  duracionMin: number,
): number {
  if (!cancha) return 0
  const horas = duracionMin / 60
  if (horas <= 0) return 0
  const tarifas = [
    ...(cancha.tarifas ?? []),
    ...(cancha.tipoCancha?.tarifas ?? []),
  ]
  if (tarifas.length === 0) return 0
  const aplicable =
    tarifas.find((t) => horaInicio >= t.horaInicio && horaInicio < t.horaFin) ??
    tarifas[0]
  return horas * Number(aplicable.precioHora)
}

function esFechaHoraPasada(fecha?: string, hora?: string): boolean {
  if (!fecha || !hora) return false
  const inicio = new Date(`${fecha}T${hora}:00`)
  return inicio.getTime() < Date.now()
}

export function ReservaForm({
  canchas = [],
  defaultCanchaId,
  defaultFecha,
  defaultHoraInicio,
  reserva,
  onSuccess,
  onCancel,
}: ReservaFormProps) {
  const crear = useCrearReserva()
  const actualizar = useActualizarReserva()
  const registrarPago = useRegistrarPagoReserva()
  const { data: me } = useUsuarioActual()

  const esEdicion = !!reserva
  const inicialesEdicion = useMemo(
    () => (reserva ? inicialesDesdeReserva(reserva) : null),
    [reserva],
  )

  const esAdminOperador =
    !!me?.roles?.some((r) =>
      ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_LOCAL', 'OPERADOR'].includes(
        r.rol,
      ),
    )

  const [cliente, setCliente] = useState<Usuario | null>(
    (reserva?.cliente as Usuario | null | undefined) ?? null,
  )
  const [clienteError, setClienteError] = useState<string | undefined>()
  // Admin/operador casi siempre registra reservas que ya están confirmadas
  // (conocido o paga al momento). El switch arranca activo y solo lo
  // apagan si quieren dejarla en PENDIENTE explícitamente. En modo edición
  // no aplica (el estado se cambia desde el detalle de la reserva).
  const [marcarConfirmada, setMarcarConfirmada] = useState(true)
  const [registrarPagoNow, setRegistrarPagoNow] = useState(false)
  const [pagoMonto, setPagoMonto] = useState<number>(0)
  const [pagoMetodo, setPagoMetodo] = useState<MetodoPago>('YAPE')
  const [pagoReferencia, setPagoReferencia] = useState('')

  const horaInicio = inicialesEdicion?.horaInicio ?? defaultHoraInicio ?? '18:00'

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      canchaId:
        inicialesEdicion ? reserva!.canchaId : defaultCanchaId ?? '',
      fecha:
        inicialesEdicion?.fecha ??
        defaultFecha ??
        new Date().toISOString().slice(0, 10),
      horaInicio,
      duracionMin: inicialesEdicion?.duracionMin ?? 60,
      notas: reserva?.notas ?? '',
    },
  })

  const fechaWatch = useWatch({ control, name: 'fecha' })
  const horaInicioWatch = useWatch({ control, name: 'horaInicio' })
  const duracionWatch = useWatch({ control, name: 'duracionMin' })
  const canchaWatch = useWatch({ control, name: 'canchaId' })

  const esPasada = useMemo(
    () => esFechaHoraPasada(fechaWatch, horaInicioWatch),
    [fechaWatch, horaInicioWatch],
  )

  // Horarios operativos y reservas existentes de la cancha en ese día.
  // Los cargamos solo cuando ya hay cancha + fecha elegidas para no hacer
  // peticiones de más.
  const { data: horariosCancha } = useHorariosByCancha(
    canchaWatch || undefined,
  )
  const rangoDia = useMemo(() => {
    if (!fechaWatch || !/^\d{4}-\d{2}-\d{2}$/.test(fechaWatch)) return null
    const [y, m, d] = fechaWatch.split('-').map((n) => parseInt(n, 10))
    const desde = new Date(y, m - 1, d, 0, 0, 0).toISOString()
    const hasta = new Date(y, m - 1, d, 23, 59, 59).toISOString()
    return { desde, hasta }
  }, [fechaWatch])

  const { data: reservasDia } = useReservas({
    canchaId: canchaWatch || undefined,
    desde: rangoDia?.desde,
    hasta: rangoDia?.hasta,
    limit: 100,
  })

  const diaSemana = useMemo(() => diaSemanaDeFecha(fechaWatch), [fechaWatch])

  const conflicto = useMemo(() => {
    // No validamos hasta que estén los 4 campos llenos. Tampoco si la
    // reserva es pasada (puede haberse jugado fuera de horario, no
    // bloqueamos al operador que la está anotando con retraso).
    if (!canchaWatch || !fechaWatch || !horaInicioWatch || !duracionWatch)
      return null
    if (esPasada) return null

    const horaFin = horaFinFromDuracion(horaInicioWatch, duracionWatch)
    if (!horaFin) return null

    // Cancha cerrada ese día.
    if (diaSemana) {
      const horario = horariosCancha?.find((h) => h.diaSemana === diaSemana)
      if (!horario) {
        return {
          tipo: 'sin-horario' as const,
          mensaje: `La cancha no atiende los ${DIA_SEMANA_LABEL[diaSemana]}. Elige otro día u otra cancha.`,
        }
      }
      if (
        horaInicioWatch < horario.horaApertura ||
        horaFin > horario.horaCierre
      ) {
        return {
          tipo: 'fuera-de-horario' as const,
          mensaje: `La cancha atiende los ${DIA_SEMANA_LABEL[diaSemana]} de ${horario.horaApertura} a ${horario.horaCierre}. Ajusta la hora o la duración.`,
        }
      }
    }

    // Overlap con otra reserva activa.
    const [yy, mm, dd] = fechaWatch.split('-').map((n) => parseInt(n, 10))
    const [hi, mi] = horaInicioWatch.split(':').map((n) => parseInt(n, 10))
    const [hf, mf] = horaFin.split(':').map((n) => parseInt(n, 10))
    const slotIni = new Date(yy, mm - 1, dd, hi, mi).getTime()
    const slotFin = new Date(yy, mm - 1, dd, hf, mf).getTime()

    const pisada = reservasDia?.data.find((r) => {
      if (['CANCELADA', 'COMPLETADA'].includes(r.estado)) return false
      const ini = new Date(r.fechaInicio).getTime()
      const fin = new Date(r.fechaFin).getTime()
      return ini < slotFin && fin > slotIni
    })
    if (pisada) {
      const nombre = pisada.cliente
        ? `${pisada.cliente.nombre} ${pisada.cliente.apellido ?? ''}`.trim()
        : null
      const desde = new Date(pisada.fechaInicio).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      })
      const hasta = new Date(pisada.fechaFin).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return {
        tipo: 'overlap' as const,
        mensaje: nombre
          ? `Esa cancha ya está reservada de ${desde} a ${hasta} a nombre de ${nombre}.`
          : `Esa cancha ya está reservada de ${desde} a ${hasta}.`,
      }
    }

    return null
  }, [
    canchaWatch,
    fechaWatch,
    horaInicioWatch,
    duracionWatch,
    esPasada,
    diaSemana,
    horariosCancha,
    reservasDia,
  ])

  // Opciones de duración: las que no harían cruzar medianoche según la
  // hora de inicio elegida. Si la hora de inicio aún no es válida,
  // mostramos todas y dejamos que el schema avise al enviar.
  const opcionesDuracion = useMemo(() => {
    const validHora = /^\d{2}:\d{2}$/.test(horaInicioWatch ?? '')
    return DURACIONES_MIN.map((min) => {
      const fin = validHora
        ? horaFinFromDuracion(horaInicioWatch, min)
        : 'pendiente'
      const cabe = fin !== null
      return {
        value: String(min),
        label: DURACION_LABEL[min],
        description: cabe && fin !== 'pendiente' ? `Termina a las ${fin}` : 'No cabe antes de medianoche',
        disabled: !cabe,
      }
    }).filter((o) => !o.disabled).map(({ disabled: _disabled, ...rest }) => rest)
  }, [horaInicioWatch])

  const horaFinPreview = useMemo(() => {
    if (!horaInicioWatch || !duracionWatch) return null
    return horaFinFromDuracion(horaInicioWatch, duracionWatch)
  }, [horaInicioWatch, duracionWatch])

  const canchaSeleccionada = useMemo(
    () => canchas.find((c) => c.id === canchaWatch),
    [canchas, canchaWatch],
  )
  const totalEstimado = useMemo(
    () =>
      calcularTotalEstimado(
        canchaSeleccionada,
        horaInicioWatch ?? '',
        duracionWatch ?? 0,
      ),
    [canchaSeleccionada, horaInicioWatch, duracionWatch],
  )
  const saldoEstimado = Math.max(0, totalEstimado - pagoMonto)

  const onSubmit = handleSubmit(async (data) => {
    if (!esEdicion && esAdminOperador && !cliente) {
      setClienteError('Selecciona o crea el cliente de la reserva')
      return
    }
    setClienteError(undefined)

    const horaFin = horaFinFromDuracion(data.horaInicio, data.duracionMin)
    if (!horaFin) return // el schema ya lo bloqueó, defensivo

    if (esEdicion && reserva) {
      await actualizar.mutateAsync({
        id: reserva.id,
        data: {
          canchaId: data.canchaId,
          fechaInicio: combineDateTime(data.fecha, data.horaInicio),
          fechaFin: combineDateTime(data.fecha, horaFin),
          notas: data.notas || '',
        },
      })
      onSuccess?.()
      return
    }

    const reservaCreada = await crear.mutateAsync({
      canchaId: data.canchaId,
      fechaInicio: combineDateTime(data.fecha, data.horaInicio),
      fechaFin: combineDateTime(data.fecha, horaFin),
      notas: data.notas || undefined,
      clienteId: cliente?.id,
      estadoInicial:
        esAdminOperador && marcarConfirmada ? 'CONFIRMADA' : undefined,
    })

    if (registrarPagoNow && pagoMonto > 0) {
      try {
        await registrarPago.mutateAsync({
          reservaId: reservaCreada.id,
          data: {
            monto: pagoMonto,
            metodoPago: pagoMetodo,
            referencia: pagoReferencia || undefined,
          },
        })
      } catch {
        /* el toast del interceptor ya avisa */
      }
    }

    onSuccess?.()
  })

  // En modo edición no mostramos el selector de cliente (el cliente no se
  // cambia desde aquí) ni el paso de "registrar pago al crear" (esos pagos
  // se manejan desde el detalle). El switch "marcar confirmada" tampoco
  // aplica porque el estado se cambia con los botones del detalle.
  const mostrarSelectorCliente = !esEdicion && esAdminOperador
  const mostrarConfirmarYPago = !esEdicion && esAdminOperador

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {esEdicion && reserva?.cliente && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
          Editando la reserva de{' '}
          <span className="font-semibold text-dark">
            {reserva.cliente.nombre} {reserva.cliente.apellido ?? ''}
          </span>
          . El cliente no se cambia desde aquí — si te equivocaste de persona,
          cancela esta reserva y crea una nueva.
        </div>
      )}

      {mostrarSelectorCliente && (
        <FormSection
          numero={1}
          icono={<UserIcon size={14} />}
          titulo="¿Para quién es la reserva?"
          descripcion="Busca al cliente por nombre o teléfono. Si es la primera vez que viene, créalo con sus datos básicos."
        >
          <ClienteSelectorReserva
            value={cliente}
            onChange={(c) => {
              setCliente(c)
              if (c) setClienteError(undefined)
            }}
            error={clienteError}
          />
        </FormSection>
      )}

      <FormSection
        numero={mostrarSelectorCliente ? 2 : 1}
        icono={<Calendar size={14} />}
        titulo="¿Cuándo y en qué cancha?"
        descripcion="Elige la cancha, la hora de inicio y cuánto va a durar el alquiler. Mínimo 1 hora, en bloques de 30 minutos."
      >
        <div className="space-y-4">
          <Controller
            name="canchaId"
            control={control}
            render={({ field, fieldState }) => (
              <SearchableSelect
                label="Cancha"
                options={canchas.map((c) => ({
                  label: c.nombre,
                  value: c.id,
                }))}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Selecciona una cancha"
                emptyText="No hay canchas disponibles"
              />
            )}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <DatePicker
              label="Fecha del partido"
              {...register('fecha')}
              error={errors.fecha?.message}
            />
            <TimePicker
              label="Hora de inicio"
              step={1800}
              {...register('horaInicio')}
              error={errors.horaInicio?.message}
            />
            <Controller
              name="duracionMin"
              control={control}
              render={({ field, fieldState }) => (
                <SearchableSelect
                  label="Duración del alquiler"
                  options={opcionesDuracion}
                  value={field.value ? String(field.value) : undefined}
                  onChange={(v) => field.onChange(parseInt(v, 10))}
                  error={fieldState.error?.message}
                  placeholder="¿Cuánto durará?"
                />
              )}
            />
          </div>

          {horaFinPreview && (
            <p className="text-xs text-gray-600">
              El partido termina a las{' '}
              <span className="font-semibold text-dark">{horaFinPreview}</span>{' '}
              del mismo día.
            </p>
          )}

          {conflicto && (
            <div className="flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-red-600"
              />
              <div>
                <p className="font-semibold">
                  {conflicto.tipo === 'overlap'
                    ? 'La cancha ya está reservada en ese horario'
                    : conflicto.tipo === 'sin-horario'
                      ? 'La cancha está cerrada ese día'
                      : 'Horario fuera del rango de atención'}
                </p>
                <p className="mt-0.5 leading-relaxed">{conflicto.mensaje}</p>
              </div>
            </div>
          )}

          {mostrarConfirmarYPago && (
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <Switch
                checked={marcarConfirmada}
                onChange={setMarcarConfirmada}
                ariaLabel="Marcar la reserva como confirmada al crearla"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-dark">
                  Marcar como confirmada al guardar
                </p>
                <p className="text-xs text-gray-500">
                  {marcarConfirmada
                    ? 'Se guardará lista para jugar. Úsalo cuando el cliente ya pagó o es conocido y vendrá seguro.'
                    : 'Se guardará como pendiente. Tendrás que confirmarla después manualmente.'}
                </p>
              </div>
            </div>
          )}

          {esPasada && (
            <div className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2.5 text-xs text-warning-700">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-warning-700"
              />
              <div>
                <p className="font-semibold">
                  Estás registrando una reserva con fecha y hora pasadas.
                </p>
                <p className="mt-0.5 leading-relaxed">
                  Úsalo solo si es una reserva que jugó y olvidaste anotar.
                  Puedes continuar normalmente, el sistema la guardará igual.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark">
              Notas (opcional)
            </label>
            <textarea
              rows={2}
              {...register('notas')}
              placeholder="Ej. 8 jugadores, traen pelota, cancelarán si llueve"
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </FormSection>

      {mostrarConfirmarYPago && (
        <FormSection
          numero={3}
          icono={<CreditCard size={14} />}
          titulo="¿Te pagó algo por adelantado?"
          descripcion="Si el cliente te dio una seña, garantía o pago completo al reservar, anótalo aquí. Si no, déjalo en blanco."
        >
          <div className="space-y-3">
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={registrarPagoNow}
                onChange={(e) => setRegistrarPagoNow(e.target.checked)}
                className="accent-primary"
              />
              <span className="font-medium text-dark">
                Sí, el cliente pagó algo al hacer la reserva
              </span>
            </label>

            {registrarPagoNow && (
              <div className="space-y-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
                {totalEstimado > 0 && (
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-2 text-center">
                    <MiniTotal
                      label="Total"
                      valor={`S/ ${totalEstimado.toFixed(2)}`}
                      tono="dark"
                    />
                    <MiniTotal
                      label="Recibido"
                      valor={`S/ ${pagoMonto.toFixed(2)}`}
                      tono="success"
                    />
                    <MiniTotal
                      label="Saldo"
                      valor={`S/ ${saldoEstimado.toFixed(2)}`}
                      tono={saldoEstimado > 0 ? 'warning' : 'muted'}
                    />
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="Monto recibido (S/)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={pagoMonto || ''}
                    onChange={(e) =>
                      setPagoMonto(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Ej. 30.00"
                    hint={
                      totalEstimado > 0
                        ? `El alquiler completo cuesta S/ ${totalEstimado.toFixed(2)}.`
                        : 'Anota lo que te entregó el cliente.'
                    }
                  />
                  <SearchableSelect
                    label="¿Cómo te pagó?"
                    options={METODOS_PAGO_RESERVA.map((m) => ({
                      label: METODO_PAGO_LABEL[m],
                      value: m,
                    }))}
                    value={pagoMetodo}
                    onChange={(v) => setPagoMetodo(v as MetodoPago)}
                  />
                </div>
                <Input
                  label="Referencia o N° de operación (opcional)"
                  leftIcon={<Hash size={14} />}
                  value={pagoReferencia}
                  onChange={(e) => setPagoReferencia(e.target.value)}
                  placeholder="Ej. número de Yape u operación bancaria"
                />
              </div>
            )}
          </div>
        </FormSection>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={!!conflicto}
          loading={
            crear.isPending || actualizar.isPending || registrarPago.isPending
          }
        >
          {esEdicion
            ? 'Guardar cambios'
            : registrarPagoNow && pagoMonto > 0
              ? 'Guardar reserva y pago'
              : 'Guardar reserva'}
        </Button>
      </div>
    </form>
  )
}

type TonoTotal = 'dark' | 'success' | 'warning' | 'muted'

const TONO_TOTAL: Record<TonoTotal, string> = {
  dark: 'text-dark',
  success: 'text-success-700',
  warning: 'text-warning-700',
  muted: 'text-gray-500',
}

function MiniTotal({
  label,
  valor,
  tono,
}: {
  label: string
  valor: string
  tono: TonoTotal
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-0.5 text-xs font-bold ${TONO_TOTAL[tono]}`}>{valor}</p>
    </div>
  )
}

function Switch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
        checked ? 'bg-success' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function FormSection({
  numero,
  icono,
  titulo,
  descripcion,
  children,
}: {
  numero: number
  icono: React.ReactNode
  titulo: string
  descripcion: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <header className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
            'bg-primary text-xs font-bold text-white',
          )}
        >
          {numero}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-dark">
            {icono}
            {titulo}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">{descripcion}</p>
        </div>
      </header>
      <div className="pl-10">{children}</div>
    </section>
  )
}
