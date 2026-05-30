import { z } from 'zod'

// Backend (ChangePasswordDto) exige: passwordNueva min 8, max 72.
// Mantenemos la misma regla de complejidad que el registro
// (al menos 1 letra y 1 número) para ser consistentes con el resto del repo.
const passwordNuevaSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede tener más de 72 caracteres')
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d).+$/,
    'La contraseña debe contener al menos una letra y un número'
  )

export const cambiarPasswordSchema = z
  .object({
    // Nombres del formulario; se mapean a los del DTO al enviar.
    passwordActual: z
      .string()
      .min(8, 'La contraseña actual debe tener al menos 8 caracteres'),
    passwordNueva: passwordNuevaSchema,
    confirmarPassword: z.string(),
  })
  .refine((d) => d.passwordNueva === d.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })
  .refine((d) => d.passwordActual !== d.passwordNueva, {
    message: 'La nueva contraseña debe ser distinta de la actual',
    path: ['passwordNueva'],
  })

export type CambiarPasswordFormData = z.infer<typeof cambiarPasswordSchema>
