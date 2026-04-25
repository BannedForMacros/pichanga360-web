import { z } from 'zod'

export const canchaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  deporte: z.enum(['FUTBOL', 'VOLEY', 'BASKET', 'TENIS', 'PADEL', 'OTRO'], {
    required_error: 'Selecciona un deporte',
  }),
  superficie: z.enum(['SINTETICO', 'GRASS', 'CEMENTO', 'MADERA'], {
    required_error: 'Selecciona una superficie',
  }),
  capacidadJugadores: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .min(2, 'Mínimo 2 jugadores')
    .max(22, 'Máximo 22 jugadores'),
  precioPorHora: z
    .number({ invalid_type_error: 'Ingresa un precio válido' })
    .min(1, 'El precio debe ser mayor a 0'),
  descripcion: z.string().optional(),
  estado: z.enum(['ACTIVA', 'INACTIVA', 'MANTENIMIENTO']).default('ACTIVA'),
})

export type CanchaFormData = z.infer<typeof canchaSchema>
