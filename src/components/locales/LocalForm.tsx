'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, ChevronDown, Hash, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MapPicker, type MapPickerValue } from '@/components/maps/MapPicker'
import {
  useCrearLocal,
  useEditarLocal,
} from '@/hooks/locales/useLocalesMutations'
import {
  localSchema,
  type LocalFormData,
} from '@/validators/locales/local.schema'
import { cn } from '@/lib/utils'
import type { Local } from '@/types'

interface Props {
  /** Si se pasa, modo edición. Si no, creación. */
  local?: Local
  onSuccess?: () => void
  onCancel?: () => void
}

export function LocalForm({ local, onSuccess, onCancel }: Props) {
  const editing = !!local
  const crear = useCrearLocal()
  const editar = useEditarLocal()
  const [mostrarManual, setMostrarManual] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      nombre: local?.nombre ?? '',
      calle: local?.calle ?? '',
      numero: local?.numero ?? '',
      distrito: local?.distrito ?? '',
      provincia: local?.provincia ?? 'Lima',
      departamento: local?.departamento ?? 'Lima',
      pais: local?.pais ?? 'Perú',
      latitud: local ? Number(local.latitud) : -12.0464,
      longitud: local ? Number(local.longitud) : -77.0428,
    },
  })

  const mapValue: MapPickerValue = {
    latitud: watch('latitud'),
    longitud: watch('longitud'),
    calle: watch('calle'),
    numero: watch('numero'),
    distrito: watch('distrito'),
    provincia: watch('provincia'),
    departamento: watch('departamento'),
  }

  const onMapChange = (v: MapPickerValue) => {
    setValue('latitud', v.latitud, { shouldValidate: true })
    setValue('longitud', v.longitud, { shouldValidate: true })
    if (v.calle !== undefined) setValue('calle', v.calle, { shouldValidate: true })
    if (v.numero !== undefined) setValue('numero', v.numero, { shouldValidate: true })
    if (v.distrito !== undefined)
      setValue('distrito', v.distrito, { shouldValidate: true })
    if (v.provincia !== undefined && v.provincia.length > 0)
      setValue('provincia', v.provincia, { shouldValidate: true })
    if (v.departamento !== undefined && v.departamento.length > 0)
      setValue('departamento', v.departamento, { shouldValidate: true })
  }

  const onSubmit = handleSubmit(async (data) => {
    if (editing) {
      await editar.mutateAsync({ id: local!.id, data })
    } else {
      await crear.mutateAsync(data)
    }
    onSuccess?.()
  })

  const isPending = editing ? editar.isPending : crear.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Nombre del local"
        placeholder="Sport Center San Isidro"
        leftIcon={<Building size={16} />}
        {...register('nombre')}
        error={errors.nombre?.message}
      />

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-700">
          Ubicación en el mapa
        </p>
        <MapPicker value={mapValue} onChange={onMapChange} height={280} />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setMostrarManual((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:border-primary"
        >
          <span className="flex items-center gap-2">
            <Pencil size={14} /> Refinar dirección manualmente
          </span>
          <ChevronDown
            size={16}
            className={cn(
              'text-gray-400 transition',
              mostrarManual && 'rotate-180',
            )}
          />
        </button>

        {mostrarManual && (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <Input
                label="Calle / Avenida"
                {...register('calle')}
                error={errors.calle?.message}
              />
              <Input
                label="Número"
                leftIcon={<Hash size={16} />}
                {...register('numero')}
                error={errors.numero?.message}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Distrito"
                {...register('distrito')}
                error={errors.distrito?.message}
              />
              <Input
                label="Provincia"
                {...register('provincia')}
                error={errors.provincia?.message}
              />
              <Input
                label="Departamento"
                {...register('departamento')}
                error={errors.departamento?.message}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={isPending}>
          {editing ? 'Guardar cambios' : 'Crear local'}
        </Button>
      </div>
    </form>
  )
}
