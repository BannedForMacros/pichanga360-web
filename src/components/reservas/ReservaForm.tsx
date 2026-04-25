'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import {
  reservaSchema,
  type ReservaFormData,
} from '@/validators/reservas/reserva.schema'
import {
  useCrearReserva,
  useEditarReserva,
} from '@/hooks/reservas/useReservasMutations'
import type { Reserva } from '@/types'

interface ReservaFormProps {
  reserva?: Reserva
  canchas?: { id: string; nombre: string }[]
  clientes?: { id: string; nombre: string; apellido: string }[]
  onSuccess?: () => void
  onCancel?: () => void
}

const metodos = [
  { label: 'Efectivo', value: 'EFECTIVO' },
  { label: 'Yape', value: 'YAPE' },
  { label: 'Plin', value: 'PLIN' },
  { label: 'Tarjeta', value: 'TARJETA' },
  { label: 'Transferencia', value: 'TRANSFERENCIA' },
]

const estados = [
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Confirmada', value: 'CONFIRMADA' },
  { label: 'Completada', value: 'COMPLETADA' },
  { label: 'Cancelada', value: 'CANCELADA' },
  { label: 'No asistió', value: 'NO_ASISTIO' },
]

export function ReservaForm({
  reserva,
  canchas = [],
  clientes = [],
  onSuccess,
  onCancel,
}: ReservaFormProps) {
  const isEdit = !!reserva
  const crear = useCrearReserva()
  const editar = useEditarReserva()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      canchaId: reserva?.canchaId ?? '',
      usuarioId: reserva?.usuarioId ?? '',
      fecha: reserva?.fecha ?? new Date().toISOString().slice(0, 10),
      horaInicio: reserva?.horaInicio ?? '18:00',
      horaFin: reserva?.horaFin ?? '19:00',
      monto: reserva?.monto ?? 0,
      estado: reserva?.estado ?? 'PENDIENTE',
      notas: reserva?.notas ?? '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await editar.mutateAsync({ id: reserva!.id, data })
    } else {
      await crear.mutateAsync(data)
    }
    onSuccess?.()
  })

  const submitting = crear.isPending || editar.isPending

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
          />
        )}
      />
      <Controller
        name="usuarioId"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Cliente"
            options={clientes.map((c) => ({
              label: `${c.nombre} ${c.apellido}`,
              value: c.id,
            }))}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            placeholder="Selecciona un cliente"
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
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="number"
          step="0.10"
          label="Monto (S/)"
          {...register('monto', { valueAsNumber: true })}
          error={errors.monto?.message}
        />
        <Controller
          name="metodoPago"
          control={control}
          render={({ field, fieldState }) => (
            <SearchableSelect
              label="Método de pago"
              options={metodos}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              placeholder="Selecciona un método"
            />
          )}
        />
      </div>
      <Controller
        name="estado"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Estado"
            options={estados}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">Notas</label>
        <textarea
          rows={3}
          {...register('notas')}
          placeholder="Detalles adicionales de la reserva"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Guardar cambios' : 'Crear reserva'}
        </Button>
      </div>
    </form>
  )
}
