'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building,
  Hash,
  MapPin,
  Compass,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import { useEmpresaActual } from '@/hooks/empresas/useEmpresaActual'
import { useLocalesEmpresa } from '@/hooks/locales/useLocalesEmpresa'
import { useCrearLocal } from '@/hooks/locales/useLocalesMutations'
import {
  localSchema,
  type LocalFormData,
} from '@/validators/locales/local.schema'
import { tokenStore } from '@/lib/api'

export function LocalOnboardingCard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me, isLoading: loadingMe } = useUsuarioActual()
  const { data: empresa } = useEmpresaActual()
  const { locales, isLoading: loadingLocales } = useLocalesEmpresa()
  const crear = useCrearLocal()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocalFormData>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      nombre: '',
      calle: '',
      numero: '',
      distrito: '',
      provincia: 'Lima',
      departamento: 'Lima',
      pais: 'Perú',
      latitud: -12.0464,
      longitud: -77.0428,
    },
  })

  // Si ya tiene un local creado o no está logueado, no tiene sentido estar aquí
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!tokenStore.getAccess()) {
      router.replace('/login')
      return
    }
    if (!loadingLocales && locales.length > 0) {
      router.replace('/dashboard')
    }
  }, [locales, loadingLocales, router])

  const onSubmit = handleSubmit(async (data) => {
    try {
      await crear.mutateAsync(data)
      // Refrescamos los datos que el dashboard usará al montar
      await queryClient.invalidateQueries({ queryKey: ['locales'] })
      await queryClient.invalidateQueries({ queryKey: ['empresas'] })
      router.push('/dashboard')
    } catch {
      /* el toast lo gestiona el interceptor */
    }
  })

  if (loadingMe) {
    return (
      <div className="flex w-full max-w-2xl items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const nombreUsuario = me?.user?.nombre ?? ''
  const nombreEmpresa = empresa?.nombre ?? 'tu empresa'

  return (
    <Card className="w-full max-w-2xl p-8">
      <div className="text-center">
        <Badge variant="success" size="md" className="mx-auto">
          Paso 2 de 2 · Configurar tu primer local
        </Badge>
        <h1 className="mt-4 text-2xl font-bold text-dark sm:text-3xl">
          {nombreUsuario ? `¡Bienvenido, ${nombreUsuario}!` : 'Bienvenido a Pichanga360'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Para que <strong className="text-dark">{nombreEmpresa}</strong> empiece a
          recibir reservas, necesitamos los datos de tu primer local físico. Podrás
          agregar más locales y canchas después desde el dashboard.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Building size={14} />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Identificación del local
            </h2>
          </div>
          <Input
            label="Nombre del local"
            placeholder="Sport Center San Isidro"
            leftIcon={<Building size={16} />}
            {...register('nombre')}
            error={errors.nombre?.message}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
              <MapPin size={14} />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Dirección
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <Input
              label="Calle / Avenida"
              placeholder="Av. Javier Prado Este"
              leftIcon={<MapPin size={16} />}
              {...register('calle')}
              error={errors.calle?.message}
            />
            <Input
              label="Número"
              placeholder="1234"
              leftIcon={<Hash size={16} />}
              {...register('numero')}
              error={errors.numero?.message}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Distrito"
              placeholder="San Isidro"
              {...register('distrito')}
              error={errors.distrito?.message}
            />
            <Input
              label="Provincia"
              placeholder="Lima"
              {...register('provincia')}
              error={errors.provincia?.message}
            />
            <Input
              label="Departamento"
              placeholder="Lima"
              {...register('departamento')}
              error={errors.departamento?.message}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
              <Compass size={14} />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Ubicación geográfica
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Latitud"
              type="number"
              step="any"
              placeholder="-12.0464"
              {...register('latitud', { valueAsNumber: true })}
              error={errors.latitud?.message}
              hint="Centro de Lima por defecto"
            />
            <Input
              label="Longitud"
              type="number"
              step="any"
              placeholder="-77.0428"
              {...register('longitud', { valueAsNumber: true })}
              error={errors.longitud?.message}
              hint="Puedes ajustarlo después"
            />
          </div>
          <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-700">
            Puedes copiar las coordenadas exactas desde Google Maps haciendo
            clic derecho sobre tu local. La ubicación se usa para que los
            jugadores te encuentren en el mapa.
          </p>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push('/dashboard')}
          >
            Saltar por ahora
          </Button>
          <Button type="submit" loading={crear.isPending}>
            Crear local y continuar
          </Button>
        </div>
      </form>
    </Card>
  )
}
