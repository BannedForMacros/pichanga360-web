import { z } from 'zod'

// Backend exige: min 8, max 72, al menos 1 letra y 1 número.
// regex: ^(?=.*[A-Za-z])(?=.*\d).+$
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede tener más de 72 caracteres')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    'La contraseña debe contener al menos una letra y un número'
  )

export const loginSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const registroSchema = z
  .object({
    nombre: z.string().min(1, 'Ingresa tu nombre').max(50),
    apellido: z.string().min(1, 'Ingresa tu apellido').max(50),
    email: z.string().email('Ingresa un email válido'),
    telefono: z
      .string()
      .regex(
        /^\+?\d{8,15}$/,
        'Ingresa un teléfono válido (ej: +51999888777)'
      )
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegistroFormData = z.infer<typeof registroSchema>
