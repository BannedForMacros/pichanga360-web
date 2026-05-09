import { z } from 'zod'

export const localSchema = z.object({
  nombre: z
    .string()
    .min(2, 'Ingresa el nombre del local')
    .max(120, 'El nombre es demasiado largo'),
  calle: z.string().min(1, 'Ingresa la calle o avenida'),
  numero: z.string().min(1, 'Ingresa el número'),
  distrito: z.string().min(1, 'Ingresa el distrito'),
  provincia: z.string().min(1, 'Ingresa la provincia'),
  departamento: z.string().min(1, 'Ingresa el departamento'),
  pais: z.string().optional(),
  latitud: z.coerce
    .number({ invalid_type_error: 'Latitud inválida' })
    .min(-90, 'Latitud fuera de rango')
    .max(90, 'Latitud fuera de rango'),
  longitud: z.coerce
    .number({ invalid_type_error: 'Longitud inválida' })
    .min(-180, 'Longitud fuera de rango')
    .max(180, 'Longitud fuera de rango'),
})

export type LocalFormData = z.infer<typeof localSchema>
