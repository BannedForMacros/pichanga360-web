'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, CreditCard, Hash } from 'lucide-react'
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
  /** YYYY-MM-DD, p.ej. la fecha que el usuario eligió en la página pública */
  defaultFecha?: string
  /** HH:mm, p.ej. el slot que el usuario clicó */
  defaultHoraInicio?: string
  /** HH:mm, calculado normalmente como horaInicio + 1h */
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

  // Si el usuario es admin/operador, ofrecemos seleccionar cliente y
  // registrar el pago en el mismo flujo. Para clientes puros se mantiene
  // el comportamiento original (reservan a su propio nombre).
  const esAdminOperador =
    !!me?.roles?.some((r) =>
      ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_LOCAL', 'OPERADOR'].includes(
        r.rol,
      ),
    )

  const [cliente, setCliente] = useState<Usuario | null>(null)
  const [clienteError, setClienteError] = useState<string | undefined>()
  const [pagoOpen, setPagoOpen] = useState(false)
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

  const onSubmit = handleSubmit(async (data) => {
    // Validación: si es admin/operador, exigimos seleccionar cliente
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

    // Si el admin marcó "registrar pago al toque", lo enviamos enseguida
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
    <form onSubmit={onSubmit} className="space-y-4">
      {esAdminOperador && (
        <ClienteSelectorReserva
          value={cliente}
          onChange={(c) => {
            setCliente(c)
            if (c) setClienteError(undefined)
          }}
          error={clienteError}
        />
      )}

      <Controller
        name="canchaId"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Cancha"
            options={canchas.map((c) => ({ label: c.nombre, value: c.id }))}
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
          label="Fecha"
          {...register('fecha')}
          error={errors.fecha?.message}
        />
        <TimePicker
          label="Hora inicio"
          {...register('horaInicio')}
          error={errors.horaInicio?.message}
        />
        <TimePicker
          label="Hora fin"
          {...register('horaFin')}
          error={errors.horaFin?.message}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">
          Notas
        </label>
        <textarea
          rows={3}
          {...register('notas')}
          placeholder="Detalles adicionales (cantidad de jugadores, requerimientos, etc.)"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {esAdminOperador && (
        <div>
          <button
            type="button"
            onClick={() => setPagoOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:border-primary"
          >
            <span className="flex items-center gap-2">
              <CreditCard size={14} />
              Registrar pago en este momento
              <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning-700">
                Opcional
              </span>
            </span>
            <ChevronDown
              size={16}
              className={cn(
                'text-gray-400 transition',
                pagoOpen && 'rotate-180',
              )}
            />
          </button>

          {pagoOpen && (
            <div className="mt-3 space-y-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={registrarPagoNow}
                  onChange={(e) => setRegistrarPagoNow(e.target.checked)}
                  className="accent-primary"
                />
                <span>Sí, el cliente paga ahora</span>
              </label>

              <div
                className={cn(
                  'grid gap-3 md:grid-cols-2 transition',
                  !registrarPagoNow && 'pointer-events-none opacity-50',
                )}
              >
                <Input
                  label="Monto (S/)"
                  type="number"
                  step="0.01"
                  value={pagoMonto || ''}
                  onChange={(e) =>
                    setPagoMonto(parseFloat(e.target.value) || 0)
                  }
                  disabled={!registrarPagoNow}
                />
                <SearchableSelect
                  label="Método"
                  options={METODOS_PAGO_RESERVA.map((m) => ({
                    label: METODO_PAGO_LABEL[m],
                    value: m,
                  }))}
                  value={pagoMetodo}
                  onChange={(v) => setPagoMetodo(v as MetodoPago)}
                  disabled={!registrarPagoNow}
                />
              </div>
              <Input
                label="Referencia / N° operación"
                leftIcon={<Hash size={14} />}
                value={pagoReferencia}
                onChange={(e) => setPagoReferencia(e.target.value)}
                placeholder="Opcional, ej. número de Yape"
                disabled={!registrarPagoNow}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          loading={crear.isPending || registrarPago.isPending}
        >
          {registrarPagoNow ? 'Crear reserva y registrar pago' : 'Crear reserva'}
        </Button>
      </div>
    </form>
  )
}
