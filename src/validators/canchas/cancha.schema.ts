import { z } from 'zod'

/**
 * Backend CreateCanchaDto requiere:
 *  - nombre: string
 *  - superficieId: string (FK)
 *  - tipoCanchaId?: string (FK opcional)
 *  - capacidadJugadores?: number
 *  - fotos?: string[]
 *
 * UpdateCanchaDto añade `estado: EstadoCancha`.
 */
export const canchaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  superficieId: z.string().min(1, 'Selecciona una superficie'),
  tipoCanchaId: z.string().optional().or(z.literal('')),
  capacidadJugadores: z
    .number({ error: 'Ingresa un número válido' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 jugador')
    .max(50, 'Máximo 50 jugadores'),
  fotos: z.array(z.string()).optional(),
  estado: z.enum(['ACTIVA', 'INACTIVA', 'MANTENIMIENTO']),
})

export type CanchaFormData = z.infer<typeof canchaSchema>
