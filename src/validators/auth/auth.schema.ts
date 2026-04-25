import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const registroSchema = z
  .object({
    nombre: z.string().min(2, 'Ingresa tu nombre'),
    apellido: z.string().min(2, 'Ingresa tu apellido'),
    email: z.string().email('Ingresa un email válido'),
    telefono: z
      .string()
      .regex(/^9\d{8}$/, 'Ingresa un número celular peruano válido (9XXXXXXXX)'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegistroFormData = z.infer<typeof registroSchema>
