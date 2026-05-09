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
import { useSuperficies } from '@/hooks/catalogos/useSuperficies'
import { useTiposCancha } from '@/hooks/catalogos/useTiposCancha'
import type { Cancha } from '@/types'

interface CanchaFormProps {
  cancha?: Cancha
  localId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const estados = [
  { label: 'Activa', value: 'ACTIVA' },
  { label: 'Inactiva', value: 'INACTIVA' },
  { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
]

export function CanchaForm({
  cancha,
  localId,
  onSuccess,
  onCancel,
}: CanchaFormProps) {
  const isEdit = !!cancha
  const crear = useCrearCancha(localId ?? cancha?.localId)
  const editar = useEditarCancha()

  const { data: superficies, isLoading: loadingSuperficies } = useSuperficies()
  const { data: tiposCancha, isLoading: loadingTipos } = useTiposCancha()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CanchaFormData>({
    resolver: zodResolver(canchaSchema),
    defaultValues: {
      nombre: cancha?.nombre ?? '',
      superficieId: cancha?.superficieId ?? '',
      tipoCanchaId: cancha?.tipoCanchaId ?? '',
      capacidadJugadores: cancha?.capacidadJugadores ?? 10,
      fotos: cancha?.fotos ?? [],
      estado: cancha?.estado ?? 'ACTIVA',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      nombre: data.nombre,
      superficieId: data.superficieId,
      tipoCanchaId: data.tipoCanchaId || undefined,
      capacidadJugadores: data.capacidadJugadores,
      fotos: data.fotos,
    }
    if (isEdit) {
      await editar.mutateAsync({
        id: cancha!.id,
        data: { ...payload, estado: data.estado },
      })
    } else {
      await crear.mutateAsync(payload)
    }
    onSuccess?.()
  })

  const submitting = crear.isPending || editar.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre de la cancha"
        placeholder="Cancha 1 — Fútbol 7"
        {...register('nombre')}
        error={errors.nombre?.message}
      />

      <Controller
        name="superficieId"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Superficie"
            options={
              superficies?.map((s) => ({ label: s.nombre, value: s.id })) ?? []
            }
            value={field.value}
            onChange={field.onChange}
            loading={loadingSuperficies}
            error={fieldState.error?.message}
            placeholder="Selecciona una superficie"
            emptyText="No hay superficies registradas"
          />
        )}
      />

      <Controller
        name="tipoCanchaId"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Tipo de cancha (opcional)"
            options={[
              { label: 'Sin tipo predefinido', value: '' },
              ...(tiposCancha?.map((t) => ({
                label: t.deporte ? `${t.nombre} · ${t.deporte.nombre}` : t.nombre,
                value: t.id,
              })) ?? []),
            ]}
            value={field.value}
            onChange={field.onChange}
            loading={loadingTipos}
            error={fieldState.error?.message}
            placeholder="Hereda capacidad y deporte si seleccionas uno"
            emptyText="No hay tipos de cancha en tu empresa"
          />
        )}
      />

      <Input
        type="number"
        label="Capacidad de jugadores"
        {...register('capacidadJugadores', { valueAsNumber: true })}
        error={errors.capacidadJugadores?.message}
        hint="Si seleccionas un tipo de cancha, puede heredar este valor."
      />

      {isEdit && (
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
      )}

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
