import { z } from 'zod'

/**
 * El backend espera fechaInicio y fechaFin como ISO 8601 completos.
 * En el form trabajamos con fecha (YYYY-MM-DD) + horaInicio + horaFin (HH:mm).
 * El componente que use este schema debe combinar antes de enviar.
 */
export const reservaSchema = z
  .object({
    canchaId: z.string().min(1, 'Selecciona una cancha'),
    fecha: z.string().min(1, 'Selecciona una fecha'),
    horaInicio: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
    horaFin: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
    notas: z.string().optional(),
  })
  .refine((data) => data.horaFin > data.horaInicio, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  })

export type ReservaFormData = z.infer<typeof reservaSchema>

/**
 * Convierte fecha (YYYY-MM-DD) + hora (HH:mm) a ISO 8601 local.
 */
export function combineDateTime(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00`).toISOString()
}
