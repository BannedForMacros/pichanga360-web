import { z } from 'zod'

export const METODOS_PAGO_RESERVA = [
  'EFECTIVO',
  'YAPE',
  'PLIN',
  'TRANSFERENCIA',
] as const

export const METODO_PAGO_LABEL: Record<
  (typeof METODOS_PAGO_RESERVA)[number],
  string
> = {
  EFECTIVO: 'Efectivo',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TRANSFERENCIA: 'Transferencia',
}

export const registrarPagoReservaSchema = z.object({
  monto: z
    .number({ message: 'Ingresa el monto' })
    .min(0.01, 'El monto debe ser mayor a 0'),
  metodoPago: z.enum(METODOS_PAGO_RESERVA),
  referencia: z.string().optional().or(z.literal('')),
})

export type RegistrarPagoReservaFormData = z.infer<
  typeof registrarPagoReservaSchema
>
