'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import {
  combineDateTime,
  reservaSchema,
  type ReservaFormData,
} from '@/validators/reservas/reserva.schema'
import { useCrearReserva } from '@/hooks/reservas/useReservasMutations'
import type { Cancha } from '@/types'

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
    await crear.mutateAsync({
      canchaId: data.canchaId,
      fechaInicio: combineDateTime(data.fecha, data.horaInicio),
      fechaFin: combineDateTime(data.fecha, data.horaFin),
      notas: data.notas || undefined,
    })
    onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
        <label className="mb-1.5 block text-sm font-medium text-dark">Notas</label>
        <textarea
          rows={3}
          {...register('notas')}
          placeholder="Detalles adicionales (cantidad de jugadores, requerimientos, etc.)"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={crear.isPending}>
          Crear reserva
        </Button>
      </div>
    </form>
  )
}
