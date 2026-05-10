import { z } from 'zod'

export const METODOS_PAGO = [
  'EFECTIVO',
  'YAPE',
  'PLIN',
  'TRANSFERENCIA',
] as const

export const registrarPagoSuscripcionSchema = z
  .object({
    suscripcionId: z.string().min(1, 'Selecciona la suscripción'),
    monto: z.number().min(0, 'El monto no puede ser negativo'),
    metodoPago: z.enum(METODOS_PAGO),
    referencia: z.string().optional().or(z.literal('')),
    periodoInicio: z.string().min(1, 'Selecciona la fecha de inicio'),
    periodoFin: z.string().min(1, 'Selecciona la fecha de fin'),
  })
  .refine((d) => new Date(d.periodoFin) > new Date(d.periodoInicio), {
    path: ['periodoFin'],
    message: 'El fin del periodo debe ser posterior al inicio',
  })

export type RegistrarPagoSuscripcionFormData = z.infer<
  typeof registrarPagoSuscripcionSchema
>

export const METODO_LABEL: Record<(typeof METODOS_PAGO)[number], string> = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
}
