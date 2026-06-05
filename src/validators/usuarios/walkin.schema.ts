import { z } from 'zod'

export const clienteWalkinSchema = z
  .object({
    // 'DNI' = persona natural; 'RUC' = empresa (razón social). Por defecto persona.
    tipoDocumento: z.enum(['DNI', 'RUC', 'CE', 'PASAPORTE']).optional(),
    numeroDocumento: z
      .string()
      .regex(/^\d{8,12}$/, 'Documento inválido (8 a 12 dígitos)')
      .optional()
      .or(z.literal('')),
    razonSocial: z.string().max(150).optional().or(z.literal('')),
    nombre: z.string().max(150).optional().or(z.literal('')),
    apellido: z.string().max(50).optional().or(z.literal('')),
    telefono: z
      .string()
      .regex(/^\+?\d{8,15}$/, 'Teléfono inválido')
      .optional()
      .or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
  })
  .superRefine((val, ctx) => {
    if (val.tipoDocumento === 'RUC') {
      // Empresa: exige razón social (el nombre/apellido no aplican).
      if (!val.razonSocial?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['razonSocial'],
          message: 'Ingresa la razón social',
        })
      }
    } else {
      // Persona: exige nombre y apellido.
      if (!val.nombre?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['nombre'],
          message: 'Ingresa el nombre',
        })
      }
      if (!val.apellido?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['apellido'],
          message: 'Ingresa el apellido',
        })
      }
    }
  })

export type ClienteWalkinFormData = z.infer<typeof clienteWalkinSchema>
