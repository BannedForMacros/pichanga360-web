'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useLogin } from '@/hooks/auth/useAuth'
import {
  loginSchema,
  type LoginFormData,
} from '@/validators/auth/auth.schema'

// Solo aceptamos rutas internas como returnTo para evitar open redirects.
function safeReturnTo(value: string | null): string {
  if (!value) return '/dashboard'
  return value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/dashboard'
}

export function LoginCard() {
  const router = useRouter()
  const params = useSearchParams()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login.mutateAsync(data)
      router.push(safeReturnTo(params.get('returnTo')))
    } catch {
      /* toast handled in interceptor */
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

      <h1 className="mt-6 text-center text-xl font-bold text-dark">
        Inicia sesión en tu cuenta
      </h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        Reservá tu cancha o gestiona tu negocio.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="tu@correo.com"
          leftIcon={<Mail size={16} />}
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register('password')}
          error={errors.password?.message}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" className="accent-primary" /> Recordarme
          </label>
          <Link href="#" className="font-semibold text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" fullWidth loading={login.isPending}>
          Ingresar
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">o</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <Button variant="outline" fullWidth>
        <span className="text-base">G</span> Continuar con Google
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" className="font-semibold text-primary hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </Card>
  )
}
