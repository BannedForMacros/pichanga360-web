'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCrearResena } from '@/hooks/reservas/useResenas'
import {
  resenaSchema,
  TIPO_OBJETIVO_RESENA,
  type ResenaFormData,
} from '@/validators/reservas/resena.schema'
import { cn } from '@/lib/utils'
import type { TipoResenaObjetivo } from '@/types'

interface Props {
  reservaId: string
  defaultTipo?: TipoResenaObjetivo
  onSuccess?: () => void
  onCancel?: () => void
}

export function ResenaForm({
  reservaId,
  defaultTipo = 'CANCHA',
  onSuccess,
  onCancel,
}: Props) {
  const crear = useCrearResena()
  const [hover, setHover] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResenaFormData>({
    resolver: zodResolver(resenaSchema),
    defaultValues: {
      tipoObjetivo: defaultTipo,
      rating: 5,
      comentario: '',
    },
  })

  const rating = watch('rating')
  const tipoObjetivo = watch('tipoObjetivo')

  const onSubmit = handleSubmit(async (data) => {
    await crear.mutateAsync({ reservaId, data })
    onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
          ¿Sobre qué quieres opinar?
        </p>
        <div className="flex gap-2">
          {TIPO_OBJETIVO_RESENA.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('tipoObjetivo', t)}
              className={cn(
                'rounded-full border px-4 py-1 text-xs font-semibold transition',
                tipoObjetivo === t
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary',
              )}
            >
              {t === 'CANCHA' ? 'La cancha' : 'El local'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-700">
          ¿Qué tan buena fue tu experiencia?
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = (hover ?? rating) >= n
            return (
              <button
                key={n}
                type="button"
                aria-label={`${n} estrellas`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setValue('rating', n)}
                className="rounded-full p-1 transition hover:scale-110"
              >
                <Star
                  size={28}
                  className={cn(
                    'transition',
                    filled ? 'fill-warning text-warning' : 'text-gray-300',
                  )}
                />
              </button>
            )
          })}
          <span className="ml-3 text-sm font-semibold text-dark">
            {rating} / 5
          </span>
        </div>
        {errors.rating && (
          <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-dark">
          Comentario (opcional)
        </label>
        <textarea
          rows={4}
          {...register('comentario')}
          placeholder="Cuéntanos cómo te fue. Esto ayuda a otros jugadores a elegir."
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.comentario && (
          <p className="mt-1 text-xs text-red-600">
            {errors.comentario.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={crear.isPending}>
          Publicar reseña
        </Button>
      </div>
    </form>
  )
}
