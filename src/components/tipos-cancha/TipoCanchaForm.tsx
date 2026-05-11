'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tag, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import {
  useCrearTipoCancha,
  useEditarTipoCancha,
} from '@/hooks/catalogos/useTiposCanchaMutations'
import { useDeportes } from '@/hooks/catalogos/useDeportes'
import {
  tipoCanchaSchema,
  type TipoCanchaFormData,
} from '@/validators/tipos-cancha/tipo-cancha.schema'
import type { TipoCancha } from '@/types'

interface Props {
  /** Si se pasa, modo edición */
  tipo?: TipoCancha
  onSuccess?: () => void
  onCancel?: () => void
}

export function TipoCanchaForm({ tipo, onSuccess, onCancel }: Props) {
  const editing = !!tipo
  const crear = useCrearTipoCancha()
  const editar = useEditarTipoCancha()
  const { data: deportes, isLoading: loadingDeportes } = useDeportes()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TipoCanchaFormData>({
    resolver: zodResolver(tipoCanchaSchema),
    defaultValues: {
      nombre: tipo?.nombre ?? '',
      deporteId: tipo?.deporteId ?? '',
      capacidadDefault: tipo?.capacidadDefault ?? 14,
      descripcion: tipo?.descripcion ?? '',
    },
  })

  const deporteId = watch('deporteId')

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      nombre: data.nombre,
      deporteId: data.deporteId,
      capacidadDefault: data.capacidadDefault,
      descripcion: data.descripcion?.length ? data.descripcion : undefined,
    }
    if (editing) {
      await editar.mutateAsync({ id: tipo!.id, data: payload })
    } else {
      await crear.mutateAsync(payload)
    }
    onSuccess?.()
  })

  const isPending = editing ? editar.isPending : crear.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Fútbol 7, Pádel 4x4, Vóley playa…"
        leftIcon={<Tag size={16} />}
        {...register('nombre')}
        error={errors.nombre?.message}
      />

      <SearchableSelect
        label="Deporte"
        options={(deportes ?? []).map((d) => ({
          label: d.nombre,
          value: d.id,
        }))}
        value={deporteId}
        onChange={(v) => setValue('deporteId', v)}
        loading={loadingDeportes}
        error={errors.deporteId?.message}
        placeholder="Selecciona un deporte"
      />

      <Input
        label="Capacidad por defecto (jugadores)"
        type="number"
        leftIcon={<Users size={16} />}
        {...register('capacidadDefault', { valueAsNumber: true })}
        error={errors.capacidadDefault?.message}
        hint="Número total de jugadores entre los dos equipos"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">
          Descripción (opcional)
        </label>
        <textarea
          rows={3}
          {...register('descripcion')}
          placeholder="Detalles que ayuden a tus clientes a entender este tipo"
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.descripcion && (
          <p className="mt-1 text-xs text-red-600">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isPending}>
          {editing ? 'Guardar cambios' : 'Crear tipo'}
        </Button>
      </div>
    </form>
  )
}
