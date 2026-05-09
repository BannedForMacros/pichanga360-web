'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { TimePicker } from '@/components/ui/TimePicker'
import {
  DIAS_LABEL,
  DIAS_SEMANA,
  horarioSchema,
  type HorarioFormData,
} from '@/validators/horarios/horario.schema'
import {
  useCrearHorario,
  useEditarHorario,
} from '@/hooks/horarios/useHorarios'
import type { DiaSemana, HorarioCancha } from '@/types'

interface HorarioFormProps {
  canchaId: string | undefined
  /** Si se pasa, modo edición. Si no, creación. */
  horario?: HorarioCancha
  /** Días que ya tienen horario en esa cancha (para deshabilitar duplicados al crear) */
  diasOcupados?: DiaSemana[]
  /** Día preseleccionado al crear (cuando se pulsa "+ agregar" en una fila vacía) */
  defaultDia?: DiaSemana
  onSuccess?: () => void
  onCancel?: () => void
}

export function HorarioForm({
  canchaId,
  horario,
  diasOcupados = [],
  defaultDia,
  onSuccess,
  onCancel,
}: HorarioFormProps) {
  const editing = !!horario
  const crear = useCrearHorario(canchaId)
  const editar = useEditarHorario()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<HorarioFormData>({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      diaSemana: horario?.diaSemana ?? defaultDia ?? 'LUNES',
      horaApertura: horario?.horaApertura ?? '07:00',
      horaCierre: horario?.horaCierre ?? '23:00',
    },
  })

  const opcionesDia = DIAS_SEMANA.map((d) => ({
    label: DIAS_LABEL[d],
    value: d,
    description:
      !editing && diasOcupados.includes(d)
        ? 'Ya configurado'
        : undefined,
  }))

  const onSubmit = handleSubmit(async (data) => {
    if (editing) {
      await editar.mutateAsync({
        id: horario!.id,
        data: {
          horaApertura: data.horaApertura,
          horaCierre: data.horaCierre,
        },
      })
    } else {
      await crear.mutateAsync({
        diaSemana: data.diaSemana as DiaSemana,
        horaApertura: data.horaApertura,
        horaCierre: data.horaCierre,
      })
    }
    onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Controller
        name="diaSemana"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Día"
            options={opcionesDia}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            disabled={editing}
            placeholder="Selecciona un día"
          />
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TimePicker
          label="Hora apertura"
          {...register('horaApertura')}
          error={errors.horaApertura?.message}
        />
        <TimePicker
          label="Hora cierre"
          {...register('horaCierre')}
          error={errors.horaCierre?.message}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          loading={editing ? editar.isPending : crear.isPending}
        >
          {editing ? 'Guardar cambios' : 'Crear horario'}
        </Button>
      </div>
    </form>
  )
}
