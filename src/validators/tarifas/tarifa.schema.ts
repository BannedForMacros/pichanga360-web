import { z } from 'zod'

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

export const TIPOS_TARIFA = ['NORMAL', 'NOCTURNA', 'FIN_DE_SEMANA'] as const

export const TIPO_TARIFA_LABEL: Record<(typeof TIPOS_TARIFA)[number], string> = {
  NORMAL: 'Normal',
  NOCTURNA: 'Nocturna',
  FIN_DE_SEMANA: 'Fin de semana',
}

export const tarifaSchema = z
  .object({
    tipo: z.enum(TIPOS_TARIFA),
    precioHora: z
      .number({ message: 'Ingresa el precio por hora' })
      .min(0, 'El precio no puede ser negativo'),
    horaInicio: z.string().regex(HORA_REGEX, 'Formato HH:mm'),
    horaFin: z.string().regex(HORA_REGEX, 'Formato HH:mm'),
  })
  .refine((d) => d.horaFin > d.horaInicio, {
    path: ['horaFin'],
    message: 'La hora de fin debe ser posterior a la de inicio',
  })

export type TarifaFormData = z.infer<typeof tarifaSchema>
