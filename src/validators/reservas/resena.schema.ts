import { z } from 'zod'

export const TIPO_OBJETIVO_RESENA = ['CANCHA', 'LOCAL'] as const

export const resenaSchema = z.object({
  tipoObjetivo: z.enum(TIPO_OBJETIVO_RESENA),
  rating: z.number().int().min(1, 'Mínimo 1 estrella').max(5),
  comentario: z.string().max(2000).optional().or(z.literal('')),
})

export type ResenaFormData = z.infer<typeof resenaSchema>
