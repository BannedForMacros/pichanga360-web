import { z } from 'zod'

export const updateEmpresaSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre es muy corto')
    .max(120, 'El nombre es demasiado largo'),
  logoUrl: z
    .string()
    .url('Ingresa una URL válida')
    .optional()
    .or(z.literal('')),
})

export type UpdateEmpresaFormData = z.infer<typeof updateEmpresaSchema>

export const TIPO_TELEFONO = ['PRINCIPAL', 'WHATSAPP', 'REFERENCIA'] as const

export const telefonoEmpresaSchema = z.object({
  codigoPais: z.string().min(2, 'Código de país inválido').max(5),
  numero: z
    .string()
    .regex(/^\d{6,15}$/, 'Solo números, entre 6 y 15 dígitos'),
  tipo: z.enum(TIPO_TELEFONO),
})

export type TelefonoEmpresaFormData = z.infer<typeof telefonoEmpresaSchema>
