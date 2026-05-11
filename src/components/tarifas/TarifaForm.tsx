'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { TimePicker } from '@/components/ui/TimePicker'
import {
  useCrearTarifaCancha,
  useEditarTarifa,
} from '@/hooks/tarifas/useTarifas'
import {
  TIPOS_TARIFA,
  TIPO_TARIFA_LABEL,
  tarifaSchema,
  type TarifaFormData,
} from '@/validators/tarifas/tarifa.schema'
import type { Tarifa, TipoTarifa } from '@/types'

interface Props {
  canchaId: string | undefined
  /** Si se pasa, modo edición. */
  tarifa?: Tarifa
  onSuccess?: () => void
  onCancel?: () => void
}

export function TarifaForm({ canchaId, tarifa, onSuccess, onCancel }: Props) {
  const editing = !!tarifa
  const crear = useCrearTarifaCancha(canchaId)
  const editar = useEditarTarifa()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TarifaFormData>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: {
      tipo: tarifa?.tipo ?? 'NORMAL',
      precioHora: tarifa ? Number(tarifa.precioHora) : 80,
      horaInicio: tarifa?.horaInicio ?? '07:00',
      horaFin: tarifa?.horaFin ?? '18:00',
    },
  })

  const tipo = watch('tipo')

  const onSubmit = handleSubmit(async (data) => {
    if (editing) {
      await editar.mutateAsync({ id: tarifa!.id, data })
    } else {
      await crear.mutateAsync(data)
    }
    onSuccess?.()
  })

  const isPending = editing ? editar.isPending : crear.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <SearchableSelect
        label="Tipo de tarifa"
        options={TIPOS_TARIFA.map((t) => ({
          label: TIPO_TARIFA_LABEL[t],
          value: t,
        }))}
        value={tipo}
        onChange={(v) => setValue('tipo', v as TipoTarifa)}
        error={errors.tipo?.message}
      />

      <Input
        label="Precio por hora (S/)"
        type="number"
        step="0.01"
        {...register('precioHora', { valueAsNumber: true })}
        error={errors.precioHora?.message}
      />

      <div className="grid gap-4 md:grid-cols-2">
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

      <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-700">
        Esta tarifa aplica solo a esta cancha (override). Para que aplique a
        todas las canchas del mismo tipo, configúrala desde "Tipos de cancha".
      </p>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isPending}>
          {editing ? 'Guardar cambios' : 'Crear tarifa'}
        </Button>
      </div>
    </form>
  )
}
