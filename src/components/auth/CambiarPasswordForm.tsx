'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCambiarPassword, useLogout } from '@/hooks/auth/useAuth'
import {
  cambiarPasswordSchema,
  type CambiarPasswordFormData,
} from '@/validators/auth/cambiar-password.schema'

export function CambiarPasswordForm() {
  const cambiar = useCambiarPassword()
  const logout = useLogout()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CambiarPasswordFormData>({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: {
      passwordActual: '',
      passwordNueva: '',
      confirmarPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await cambiar.mutateAsync(data)
    reset()
    // El backend revoca TODAS las sesiones al cambiar la contraseña, así que la
    // sesión actual queda invalidada: cerramos sesión para que vuelva a entrar.
    toast('Por seguridad, vuelve a iniciar sesión.', { position: 'top-right' })
    await logout()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Contraseña actual"
        type="password"
        autoComplete="current-password"
        leftIcon={<Lock size={16} />}
        {...register('passwordActual')}
        error={errors.passwordActual?.message}
      />
      <Input
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        leftIcon={<Lock size={16} />}
        {...register('passwordNueva')}
        error={errors.passwordNueva?.message}
        hint="Mínimo 8 caracteres, con al menos una letra y un número."
      />
      <Input
        label="Confirmar nueva contraseña"
        type="password"
        autoComplete="new-password"
        leftIcon={<Lock size={16} />}
        {...register('confirmarPassword')}
        error={errors.confirmarPassword?.message}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={cambiar.isPending}
          disabled={!isDirty || cambiar.isPending}
        >
          Cambiar contraseña
        </Button>
      </div>
    </form>
  )
}
