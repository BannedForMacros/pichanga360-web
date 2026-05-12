import { z } from 'zod'

export const clienteWalkinSchema = z.object({
  nombre: z.string().min(1, 'Ingresa el nombre').max(50),
  apellido: z.string().min(1, 'Ingresa el apellido').max(50),
  telefono: z
    .string()
    .regex(/^\+?\d{8,15}$/, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type ClienteWalkinFormData = z.infer<typeof clienteWalkinSchema>
