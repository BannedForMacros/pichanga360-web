import { z } from 'zod'

/**
 * Backend CreateProductoDto:
 *  - nombre: string
 *  - categoriaId: string (FK CategoriaProducto)
 *  - precio: number
 *  - stock?: number (>=0)
 *  - imagenUrl?: string
 *
 * UpdateProductoDto añade `activo?: boolean`.
 */
export const productoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  categoriaId: z.string().min(1, 'Selecciona una categoría'),
  precio: z
    .number({ error: 'Ingresa un precio válido' })
    .min(0, 'El precio no puede ser negativo'),
  stock: z
    .number({ error: 'Ingresa el stock' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  imagenUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  activo: z.boolean(),
})

export type ProductoFormData = z.infer<typeof productoSchema>
