'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  Building,
  ChevronDown,
  Hash,
  MapPin,
  Pencil,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { MapPicker, type MapPickerValue } from '@/components/maps/MapPicker'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import { useEmpresaActual } from '@/hooks/empresas/useEmpresaActual'
import { useLocalesEmpresa } from '@/hooks/locales/useLocalesEmpresa'
import { useCrearLocal } from '@/hooks/locales/useLocalesMutations'
import {
  localSchema,
  type LocalFormData,
} from '@/validators/locales/local.schema'
import { tokenStore } from '@/lib/api'
import { cn } from '@/lib/utils'

export function LocalOnboardingCard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: me, isLoading: loadingMe } = useUsuarioActual()
  const { data: empresa } = useEmpresaActual()
  const { locales, isLoading: loadingLocales } = useLocalesEmpresa()
  const crear = useCrearLocal()
  // El bloque "refinar manualmente" arranca abierto y solo se cierra/abre con
  // el toggle del usuario. NUNCA depende de si los campos están llenos —
  // si dependiera, escribir un dígito lo cerraría y perderías el foco del input.
  const [mostrarManual, setMostrarManual] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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

  // Valor sincronizado con el mapa
  const mapValue: MapPickerValue = {
    latitud: watch('latitud'),
    longitud: watch('longitud'),
    calle: watch('calle'),
    numero: watch('numero'),
    distrito: watch('distrito'),
    provincia: watch('provincia'),
    departamento: watch('departamento'),
  }

  const onMapChange = (v: MapPickerValue) => {
    setValue('latitud', v.latitud, { shouldValidate: true })
    setValue('longitud', v.longitud, { shouldValidate: true })
    if (v.calle !== undefined) setValue('calle', v.calle, { shouldValidate: true })
    if (v.numero !== undefined) setValue('numero', v.numero, { shouldValidate: true })
    if (v.distrito !== undefined)
      setValue('distrito', v.distrito, { shouldValidate: true })
    if (v.provincia !== undefined && v.provincia.length > 0)
      setValue('provincia', v.provincia, { shouldValidate: true })
    if (v.departamento !== undefined && v.departamento.length > 0)
      setValue('departamento', v.departamento, { shouldValidate: true })
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      await crear.mutateAsync(data)
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

  // Solo informativo: se usa para decidir si pintar el badge "Recomendado"
  // junto al toggle. NUNCA condiciona el render de los inputs.
  const direccionLista =
    !!mapValue.calle &&
    !!mapValue.numero &&
    !!mapValue.distrito &&
    !!mapValue.provincia &&
    !!mapValue.departamento

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
          recibir reservas, necesitamos los datos de tu primer local físico.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        {/* Nombre */}
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

        {/* Mapa */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
              <MapPin size={14} />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Ubicación en el mapa
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Busca tu dirección, mueve el pin con el mouse o usa el botón “Mi
            ubicación”. La dirección se completa sola.
          </p>
          <MapPicker value={mapValue} onChange={onMapChange} />

          {(errors.latitud || errors.longitud) && (
            <p className="text-xs text-red-600">
              {errors.latitud?.message ?? errors.longitud?.message}
            </p>
          )}
        </section>

        {/* Refinar manualmente */}
        <section>
          <button
            type="button"
            onClick={() => setMostrarManual((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm font-semibold text-gray-700 hover:border-primary"
          >
            <span className="flex items-center gap-2">
              <Pencil size={14} />
              {direccionLista
                ? 'Refinar dirección manualmente'
                : 'Completar dirección manualmente'}
              {!direccionLista && (
                <span className="ml-2 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase text-warning-700">
                  Recomendado
                </span>
              )}
            </span>
            <ChevronDown
              size={16}
              className={cn(
                'text-gray-400 transition',
                mostrarManual && 'rotate-180',
              )}
            />
          </button>

          {mostrarManual && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                <Input
                  label="Calle / Avenida"
                  placeholder="Av. Javier Prado Este"
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
            </div>
          )}
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
