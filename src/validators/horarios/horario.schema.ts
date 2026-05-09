import { z } from 'zod'

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export const DIAS_SEMANA = [
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
  'DOMINGO',
] as const

export const horarioSchema = z
  .object({
    diaSemana: z.enum(DIAS_SEMANA),
    horaApertura: z.string().regex(HORA_REGEX, 'Formato HH:mm requerido'),
    horaCierre: z.string().regex(HORA_REGEX, 'Formato HH:mm requerido'),
  })
  .refine((d) => d.horaCierre > d.horaApertura, {
    path: ['horaCierre'],
    message: 'La hora de cierre debe ser mayor que la apertura',
  })

export type HorarioFormData = z.infer<typeof horarioSchema>

export const DIAS_LABEL: Record<(typeof DIAS_SEMANA)[number], string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
}
