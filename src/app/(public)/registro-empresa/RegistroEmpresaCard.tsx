'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  Hash,
  Image as ImageIcon,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useRegistroEmpresa } from '@/hooks/auth/useAuth'
import {
  registroEmpresaSchema,
  type RegistroEmpresaFormData,
} from '@/validators/auth/auth.schema'

export function RegistroEmpresaCard() {
  const router = useRouter()
  const registro = useRegistroEmpresa()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroEmpresaFormData>({
    resolver: zodResolver(registroEmpresaSchema),
    defaultValues: {
      empresaNombre: '',
      ruc: '',
      logoUrl: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      confirmarPassword: '',
      aceptoTerminos: false,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registro.mutateAsync(data)
      // Recién creado: la empresa todavía no tiene local. El DashboardGuard
      // detectará esto y nos llevará a /onboarding automáticamente, pero lo
      // empujamos explícito para no esperar el redirect.
      router.push('/onboarding')
    } catch {
      /* el toast lo gestiona el interceptor de axios */
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

      <div className="mt-6 text-center">
        <Badge variant="warning" size="md" className="mx-auto bg-warning text-white">
          Plan BÁSICO · 30 días gratis
        </Badge>
        <h1 className="mt-3 text-xl font-bold text-dark sm:text-2xl">
          Registra tu empresa de canchas
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Crea tu cuenta de administrador y empieza a recibir reservas hoy mismo.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        {/* SECCIÓN EMPRESA */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Building2 size={14} />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Datos de la empresa
            </h2>
          </div>
          <Input
            label="Razón social"
            placeholder="Canchas El Golazo SAC"
            leftIcon={<Building2 size={16} />}
            {...register('empresaNombre')}
            error={errors.empresaNombre?.message}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="RUC"
              placeholder="20512345678"
              leftIcon={<Hash size={16} />}
              maxLength={11}
              {...register('ruc')}
              error={errors.ruc?.message}
              hint="11 dígitos"
            />
            <Input
              label="Logo (URL)"
              placeholder="https://..."
              leftIcon={<ImageIcon size={16} />}
              {...register('logoUrl')}
              error={errors.logoUrl?.message}
              hint="Opcional"
            />
          </div>
        </section>

        {/* SECCIÓN ADMIN */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
              <User size={14} />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Tus datos como administrador
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nombre"
              placeholder="Carlos"
              leftIcon={<User size={16} />}
              {...register('nombre')}
              error={errors.nombre?.message}
            />
            <Input
              label="Apellido"
              placeholder="Mendoza"
              {...register('apellido')}
              error={errors.apellido?.message}
            />
          </div>
          <Input
            label="Email corporativo"
            type="email"
            placeholder="admin@elgolazo.pe"
            leftIcon={<Mail size={16} />}
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Celular"
            type="tel"
            placeholder="+51999888777"
            leftIcon={<Phone size={16} />}
            {...register('telefono')}
            error={errors.telefono?.message}
            hint="Opcional — útil para recordar reservas por WhatsApp"
          />
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>
        </section>

        {/* TÉRMINOS */}
        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            className="mt-0.5 accent-primary"
            {...register('aceptoTerminos')}
          />
          <span>
            Acepto los{' '}
            <Link href="#" className="font-semibold text-primary hover:underline">
              Términos
            </Link>{' '}
            y la{' '}
            <Link href="#" className="font-semibold text-primary hover:underline">
              Política de privacidad
            </Link>
            , y autorizo el uso de mis datos para crear esta cuenta.
          </span>
        </label>
        {errors.aceptoTerminos && (
          <p className="-mt-2 text-xs text-red-600">
            {errors.aceptoTerminos.message}
          </p>
        )}

        <Button type="submit" fullWidth loading={registro.isPending}>
          Crear empresa y continuar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
      <p className="mt-1 text-center text-xs text-gray-500">
        ¿Eres jugador y solo quieres reservar?{' '}
        <Link href="/registro" className="font-semibold text-primary hover:underline">
          Crea una cuenta de cliente
        </Link>
      </p>
    </Card>
  )
}
