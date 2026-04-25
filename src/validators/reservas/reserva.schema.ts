import { z } from 'zod'

export const reservaSchema = z
  .object({
    canchaId: z.string().min(1, 'Selecciona una cancha'),
    usuarioId: z.string().min(1, 'Selecciona un cliente'),
    fecha: z.string().min(1, 'Selecciona una fecha'),
    horaInicio: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
    horaFin: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
    monto: z
      .number({ invalid_type_error: 'Ingresa un monto válido' })
      .min(0, 'El monto no puede ser negativo'),
    estado: z
      .enum(['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_ASISTIO'])
      .default('PENDIENTE'),
    metodoPago: z
      .enum(['EFECTIVO', 'YAPE', 'PLIN', 'TARJETA', 'TRANSFERENCIA'])
      .optional(),
    notas: z.string().optional(),
  })
  .refine((data) => data.horaFin > data.horaInicio, {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['horaFin'],
  })

export type ReservaFormData = z.infer<typeof reservaSchema>
