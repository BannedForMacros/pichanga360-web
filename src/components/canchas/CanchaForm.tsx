'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import {
  canchaSchema,
  type CanchaFormData,
} from '@/validators/canchas/cancha.schema'
import {
  useCrearCancha,
  useEditarCancha,
} from '@/hooks/canchas/useCanchasMutations'
import type { Cancha } from '@/types'

interface CanchaFormProps {
  cancha?: Cancha
  onSuccess?: () => void
  onCancel?: () => void
}

const deportes = [
  { label: 'Fútbol', value: 'FUTBOL' },
  { label: 'Vóley', value: 'VOLEY' },
  { label: 'Básquet', value: 'BASKET' },
  { label: 'Tenis', value: 'TENIS' },
  { label: 'Pádel', value: 'PADEL' },
  { label: 'Otro', value: 'OTRO' },
]

const superficies = [
  { label: 'Sintético', value: 'SINTETICO' },
  { label: 'Grass natural', value: 'GRASS' },
  { label: 'Cemento', value: 'CEMENTO' },
  { label: 'Madera', value: 'MADERA' },
]

const estados = [
  { label: 'Activa', value: 'ACTIVA' },
  { label: 'Inactiva', value: 'INACTIVA' },
  { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
]

export function CanchaForm({ cancha, onSuccess, onCancel }: CanchaFormProps) {
  const isEdit = !!cancha
  const crear = useCrearCancha()
  const editar = useEditarCancha()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CanchaFormData>({
    resolver: zodResolver(canchaSchema),
    defaultValues: {
      nombre: cancha?.nombre ?? '',
      deporte: cancha?.deporte ?? 'FUTBOL',
      superficie: cancha?.superficie ?? 'SINTETICO',
      capacidadJugadores: cancha?.capacidadJugadores ?? 10,
      precioPorHora: cancha?.precioPorHora ?? 80,
      descripcion: cancha?.descripcion ?? '',
      estado: cancha?.estado ?? 'ACTIVA',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await editar.mutateAsync({ id: cancha!.id, data })
    } else {
      await crear.mutateAsync(data)
    }
    onSuccess?.()
  })

  const submitting = crear.isPending || editar.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre de la cancha"
        placeholder="Cancha Fútbol 1"
        {...register('nombre')}
        error={errors.nombre?.message}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          name="deporte"
          control={control}
          render={({ field, fieldState }) => (
            <SearchableSelect
              label="Deporte"
              options={deportes}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              placeholder="Selecciona un deporte"
            />
          )}
        />
        <Controller
          name="superficie"
          control={control}
          render={({ field, fieldState }) => (
            <SearchableSelect
              label="Superficie"
              options={superficies}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              placeholder="Selecciona una superficie"
            />
          )}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="number"
          label="Capacidad de jugadores"
          {...register('capacidadJugadores', { valueAsNumber: true })}
          error={errors.capacidadJugadores?.message}
        />
        <Input
          type="number"
          step="0.10"
          label="Precio por hora (S/)"
          {...register('precioPorHora', { valueAsNumber: true })}
          error={errors.precioPorHora?.message}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">
          Descripción
        </label>
        <textarea
          rows={3}
          {...register('descripcion')}
          placeholder="Detalles adicionales (iluminación, vestuarios, etc.)"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Guardar cambios' : 'Crear cancha'}
        </Button>
      </div>
    </form>
  )
}
