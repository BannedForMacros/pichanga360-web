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
  reservaSchema,
  type ReservaFormData,
} from '@/validators/reservas/reserva.schema'
import { useCrearReserva } from '@/hooks/reservas/useReservasMutations'
import { useRegistrarPagoReserva } from '@/hooks/reservas/usePagosReserva'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import {
  METODOS_PAGO_RESERVA,
  METODO_PAGO_LABEL,
} from '@/validators/reservas/pago-reserva.schema'
import { cn } from '@/lib/utils'
import type { Cancha, MetodoPago, Usuario } from '@/types'

interface ReservaFormProps {
  canchas?: Pick<Cancha, 'id' | 'nombre'>[]
  defaultCanchaId?: string
  /** YYYY-MM-DD */
  defaultFecha?: string
  /** HH:mm */
  defaultHoraInicio?: string
  /** HH:mm (default: horaInicio + 1h) */
  defaultHoraFin?: string
  onSuccess?: () => void
  onCancel?: () => void
}

function sumarHora(hhmm: string, horas: number): string {
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10))
  const total = h * 60 + m + horas * 60
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
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
  defaultHoraFin,
  onSuccess,
  onCancel,
}: ReservaFormProps) {
  const crear = useCrearReserva()
  const registrarPago = useRegistrarPagoReserva()
  const { data: me } = useUsuarioActual()

  const esAdminOperador =
    !!me?.roles?.some((r) =>
      ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_LOCAL', 'OPERADOR'].includes(
        r.rol,
      ),
    )

  const [cliente, setCliente] = useState<Usuario | null>(null)
  const [clienteError, setClienteError] = useState<string | undefined>()
  const [registrarPagoNow, setRegistrarPagoNow] = useState(false)
  const [pagoMonto, setPagoMonto] = useState<number>(0)
  const [pagoMetodo, setPagoMetodo] = useState<MetodoPago>('YAPE')
  const [pagoReferencia, setPagoReferencia] = useState('')

  const horaInicio = defaultHoraInicio ?? '18:00'
  const horaFin = defaultHoraFin ?? sumarHora(horaInicio, 1)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      canchaId: defaultCanchaId ?? '',
      fecha: defaultFecha ?? new Date().toISOString().slice(0, 10),
      horaInicio,
      horaFin,
      notas: '',
    },
  })

  const fechaWatch = useWatch({ control, name: 'fecha' })
  const horaInicioWatch = useWatch({ control, name: 'horaInicio' })
  const esPasada = useMemo(
    () => esFechaHoraPasada(fechaWatch, horaInicioWatch),
    [fechaWatch, horaInicioWatch],
  )

  const onSubmit = handleSubmit(async (data) => {
    if (esAdminOperador && !cliente) {
      setClienteError('Selecciona o crea el cliente de la reserva')
      return
    }
    setClienteError(undefined)

    const reserva = await crear.mutateAsync({
      canchaId: data.canchaId,
      fechaInicio: combineDateTime(data.fecha, data.horaInicio),
      fechaFin: combineDateTime(data.fecha, data.horaFin),
      notas: data.notas || undefined,
      clienteId: cliente?.id,
    })

    if (registrarPagoNow && pagoMonto > 0) {
      try {
        await registrarPago.mutateAsync({
          reservaId: reserva.id,
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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {esAdminOperador && (
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
        numero={esAdminOperador ? 2 : 1}
        icono={<Calendar size={14} />}
        titulo="¿Cuándo y en qué cancha?"
        descripcion="Elige la cancha y el horario. La hora de fin se calcula automáticamente, pero puedes ajustarla."
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
              {...register('horaInicio')}
              error={errors.horaInicio?.message}
            />
            <TimePicker
              label="Hora de fin"
              {...register('horaFin')}
              error={errors.horaFin?.message}
            />
          </div>

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

      {esAdminOperador && (
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
          loading={crear.isPending || registrarPago.isPending}
        >
          {registrarPagoNow && pagoMonto > 0
            ? 'Guardar reserva y pago'
            : 'Guardar reserva'}
        </Button>
      </div>
    </form>
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
