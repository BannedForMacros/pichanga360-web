import { z } from 'zod'

export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  categoria: z.string().min(1, 'Selecciona una categoría'),
  precio: z
    .number({ invalid_type_error: 'Ingresa un precio válido' })
    .min(0.1, 'El precio debe ser mayor a 0'),
  stock: z
    .number({ invalid_type_error: 'Ingresa el stock' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  imagenUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  activo: z.boolean().default(true),
})

export type ProductoFormData = z.infer<typeof productoSchema>
