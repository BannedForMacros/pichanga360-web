import { z } from 'zod'

export const tipoCanchaSchema = z.object({
  nombre: z.string().min(2, 'El nombre es muy corto').max(80),
  deporteId: z.string().min(1, 'Selecciona un deporte'),
  capacidadDefault: z
    .number({ message: 'Ingresa la capacidad' })
    .int('Debe ser un número entero')
    .min(1, 'Mínimo 1 jugador'),
  descripcion: z.string().max(500).optional().or(z.literal('')),
})

export type TipoCanchaFormData = z.infer<typeof tipoCanchaSchema>
