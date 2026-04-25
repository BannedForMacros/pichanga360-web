'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useRegistro } from '@/hooks/auth/useAuth'
import {
  registroSchema,
  type RegistroFormData,
} from '@/validators/auth/auth.schema'

export function RegistroCard() {
  const router = useRouter()
  const registro = useRegistro()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registro.mutateAsync(data)
      router.push('/dashboard')
    } catch {
      /* toast manejado por interceptor */
    }
  })

  return (
    <Card className="w-full p-8">
      <Link href="/" className="flex items-center justify-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
          <span className="text-lg font-black">P</span>
        </span>
        <span className="text-lg font-extrabold tracking-tight text-primary">
          Pichanga<span className="text-warning">360</span>
        </span>
      </Link>

      <h1 className="mt-6 text-center text-xl font-bold text-dark">Crea tu cuenta</h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        Reserva canchas más rápido o registra la tuya.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nombre"
            placeholder="Roberto"
            leftIcon={<User size={16} />}
            {...register('nombre')}
            error={errors.nombre?.message}
          />
          <Input
            label="Apellido"
            placeholder="Cárdenas"
            {...register('apellido')}
            error={errors.apellido?.message}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="tu@correo.com"
          leftIcon={<Mail size={16} />}
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Celular"
          type="tel"
          placeholder="9XXXXXXXX"
          leftIcon={<Phone size={16} />}
          {...register('telefono')}
          error={errors.telefono?.message}
          hint="Solo números — 9 dígitos. Ej: 987654321"
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          {...register('confirmarPassword')}
          error={errors.confirmarPassword?.message}
        />
        <p className="text-xs text-gray-500">
          Al continuar aceptas nuestros{' '}
          <Link href="#" className="font-semibold text-primary hover:underline">
            Términos
          </Link>{' '}
          y la{' '}
          <Link href="#" className="font-semibold text-primary hover:underline">
            Política de privacidad
          </Link>
          .
        </p>
        <Button type="submit" fullWidth loading={registro.isPending}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Card>
  )
}
