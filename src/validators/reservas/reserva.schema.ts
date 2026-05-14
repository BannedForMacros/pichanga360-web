import { z } from 'zod'

/**
 * El backend espera fechaInicio y fechaFin como ISO 8601 completos.
 * En el form trabajamos con fecha (YYYY-MM-DD), horaInicio (HH:mm) y la
 * duración del alquiler en minutos. La hora fin se deriva al enviar.
 *
 * Reglas de negocio:
 *  - El alquiler mínimo es 1 hora.
 *  - Solo aceptamos múltiplos de 30 minutos (1h, 1h30, 2h, 2h30, …). Nada de
 *    cuartos de hora ni minutos sueltos.
 *  - El partido tiene que terminar el mismo día (no cruzar medianoche).
 */
export const DURACIONES_MIN = [60, 90, 120, 150, 180, 210, 240, 270, 300] as const

export const DURACION_LABEL: Record<number, string> = {
  60: '1 hora',
  90: '1 hora 30 min',
  120: '2 horas',
  150: '2 horas 30 min',
  180: '3 horas',
  210: '3 horas 30 min',
  240: '4 horas',
  270: '4 horas 30 min',
  300: '5 horas',
}

export const reservaSchema = z
  .object({
    canchaId: z.string().min(1, 'Selecciona una cancha'),
    fecha: z.string().min(1, 'Selecciona una fecha'),
    horaInicio: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)')
      .refine(
        (h) => {
          const min = parseInt(h.split(':')[1], 10)
          return min === 0 || min === 30
        },
        'La hora de inicio va en bloques de 30 minutos (ej. 19:00 o 19:30)',
      ),
    duracionMin: z
      .number({ message: 'Selecciona cuánto va a durar el alquiler' })
      .int()
      .min(60, 'El alquiler mínimo es de 1 hora')
      .refine((m) => m % 30 === 0, 'La duración debe ir de 30 en 30 minutos'),
    notas: z.string().optional(),
  })
  .refine(
    (data) => {
      const fin = horaFinFromDuracion(data.horaInicio, data.duracionMin)
      return fin !== null
    },
    {
      message:
        'El partido terminaría después de medianoche. Reduce la duración o adelanta la hora de inicio.',
      path: ['duracionMin'],
    },
  )

export type ReservaFormData = z.infer<typeof reservaSchema>

/**
 * Suma minutos a un HH:mm. Devuelve null si cruzaría medianoche.
 */
export function horaFinFromDuracion(
  horaInicio: string,
  duracionMin: number,
): string | null {
  const [h, m] = horaInicio.split(':').map((n) => parseInt(n, 10))
  const total = h * 60 + m + duracionMin
  if (total > 24 * 60) return null
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/**
 * Convierte fecha (YYYY-MM-DD) + hora (HH:mm) a ISO 8601 local.
 */
export function combineDateTime(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00`).toISOString()
}
