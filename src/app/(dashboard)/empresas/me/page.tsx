'use client'

import { Building2, Hash, MapPin, Phone, Sparkles } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmpresaForm } from '@/components/empresas/EmpresaForm'
import { TelefonosEmpresa } from '@/components/empresas/TelefonosEmpresa'
import { useEmpresaActual } from '@/hooks/empresas/useEmpresaActual'
import { useLocalesEmpresa } from '@/hooks/locales/useLocalesEmpresa'

export default function MiEmpresaPage() {
  const { open } = useDashboardMenu()
  const { data: empresa, isLoading } = useEmpresaActual()
  const { locales } = useLocalesEmpresa()

  return (
    <>
      <Header
        title="Mi Empresa"
        breadcrumb={[{ label: 'Empresa' }, { label: 'Mi Empresa' }]}
        onOpenMenu={open}
      />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !empresa ? (
          <Card>
            <p className="text-base font-semibold text-dark">
              No encontramos tu empresa
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Esto pasa si tu rol no está vinculado a una empresa todavía.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Columna izquierda: form de datos + teléfonos */}
            <div className="space-y-6">
              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
                    <Building2 size={14} />
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Datos de la empresa
                  </h2>
                </div>
                <EmpresaForm empresa={empresa} />
              </Card>

              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
                    <Phone size={14} />
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Teléfonos de contacto
                  </h2>
                </div>
                <p className="mb-4 text-xs text-gray-500">
                  Estos teléfonos se usan en avisos a clientes y notificaciones
                  WhatsApp.
                </p>
                <TelefonosEmpresa telefonos={empresa.telefonos ?? []} />
              </Card>
            </div>

            {/* Columna derecha: info readonly */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3">
                  {empresa.logoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={empresa.logoUrl}
                      alt={empresa.nombre}
                      className="h-14 w-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white">
                      <Building2 size={22} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-dark">
                      {empresa.nombre}
                    </p>
                    <Badge variant={empresa.activa ? 'success' : 'neutral'}>
                      {empresa.activa ? 'Activa' : 'Suspendida'}
                    </Badge>
                  </div>
                </div>

                <ul className="mt-5 space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400" />
                    <span>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        RUC
                      </span>
                      <span className="font-mono text-dark">{empresa.ruc}</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Locales
                      </span>
                      <span className="font-semibold text-dark">
                        {locales.length}
                      </span>
                    </span>
                  </li>
                </ul>
              </Card>

              <Card className="bg-primary text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-warning" />
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    Tu plan
                  </p>
                </div>
                <p className="mt-2 text-xs text-white/70">
                  Mira tus suscripciones, cambia de plan o registra pagos en la
                  página de Suscripciones.
                </p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
