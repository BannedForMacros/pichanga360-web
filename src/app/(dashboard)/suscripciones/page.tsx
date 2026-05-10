'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  RefreshCcw,
  X,
} from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { useEmpresaActual } from '@/hooks/empresas/useEmpresaActual'
import { usePlanes } from '@/hooks/planes/usePlanes'
import {
  useCambiarPlan,
  useCancelarSuscripcion,
  useRenovarSuscripcion,
  useSuscripcionesActuales,
} from '@/hooks/suscripciones/useSuscripciones'
import { cn } from '@/lib/utils'
import type { EstadoSuscripcion, Plan, Suscripcion } from '@/types'

const ESTADO_VARIANT: Record<
  EstadoSuscripcion,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  ACTIVA: 'success',
  VENCIDA: 'warning',
  SUSPENDIDA: 'warning',
  CANCELADA: 'danger',
}

function formatFecha(iso: string) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
  }).format(new Date(iso))
}

function diasRestantes(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function SuscripcionesPage() {
  const { open } = useDashboardMenu()
  const { data: empresa } = useEmpresaActual()
  const { data: suscripciones, isLoading } = useSuscripcionesActuales()
  const { data: planes } = usePlanes()
  const cambiar = useCambiarPlan()
  const renovar = useRenovarSuscripcion()
  const cancelar = useCancelarSuscripcion()

  const [confirmCancelarId, setConfirmCancelarId] = useState<string | null>(null)
  const [confirmCambiarPlan, setConfirmCambiarPlan] = useState<Plan | null>(null)

  // La suscripción ACTIVA más reciente. Si no hay activa, la última creada.
  const actual = useMemo<(Suscripcion & { plan?: Plan }) | undefined>(() => {
    if (!suscripciones?.length) return undefined
    return (
      suscripciones.find((s) => s.estado === 'ACTIVA') ?? suscripciones[0]
    )
  }, [suscripciones])

  const planesOrdenados = useMemo(() => {
    const order = ['BASICO', 'PRO', 'ENTERPRISE'] as const
    return [...(planes ?? [])].sort(
      (a, b) => order.indexOf(a.codigo) - order.indexOf(b.codigo),
    )
  }, [planes])

  return (
    <>
      <Header
        title="Suscripción"
        breadcrumb={[{ label: 'Empresa' }, { label: 'Suscripción' }]}
        onOpenMenu={open}
      />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Plan actual */}
            <Card>
              {actual ? (
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Tu plan actual
                      </span>
                      <Badge variant={ESTADO_VARIANT[actual.estado]}>
                        {actual.estado}
                      </Badge>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-dark">
                      {actual.plan?.nombre ?? '—'}
                    </p>
                    {actual.plan && (
                      <p className="mt-1 text-sm text-gray-600">
                        S/{' '}
                        {Number(actual.plan.precioMensual).toLocaleString(
                          'es-PE',
                          { minimumFractionDigits: 2 },
                        )}{' '}
                        / mes · hasta {actual.plan.maxLocales} locales,{' '}
                        {actual.plan.maxCanchas} canchas
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> Inicio{' '}
                        <strong className="font-semibold text-dark">
                          {formatFecha(actual.fechaInicio)}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> Vence{' '}
                        <strong className="font-semibold text-dark">
                          {formatFecha(actual.fechaVencimiento)}
                        </strong>
                      </span>
                      {actual.estado === 'ACTIVA' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-success-700">
                          {diasRestantes(actual.fechaVencimiento)} días restantes
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<RefreshCcw size={14} />}
                      loading={renovar.isPending}
                      onClick={() =>
                        renovar.mutate({ id: actual.id, diasExtension: 30 })
                      }
                    >
                      Renovar 30 días
                    </Button>
                    {actual.estado === 'ACTIVA' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<X size={14} />}
                        onClick={() => setConfirmCancelarId(actual.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="mt-0.5 text-warning" />
                  <div>
                    <p className="font-semibold text-dark">
                      No tienes una suscripción activa
                    </p>
                    <p className="text-sm text-gray-600">
                      {empresa
                        ? 'Elige un plan abajo para empezar.'
                        : 'Tu empresa todavía se está configurando.'}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Comparativa de planes */}
            <section>
              <h2 className="text-base font-semibold text-dark">
                Cambiar de plan
              </h2>
              <p className="text-xs text-gray-500">
                Elige el plan que mejor se adapte a tu operación.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {planesOrdenados.map((p) => {
                  const esActual = actual?.plan?.id === p.id
                  return (
                    <Card
                      key={p.id}
                      className={cn(
                        'flex flex-col',
                        esActual && 'border-2 border-primary shadow-md',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold uppercase tracking-wide text-primary">
                          {p.nombre}
                        </p>
                        {esActual && (
                          <Badge variant="primary" size="sm">
                            Tu plan
                          </Badge>
                        )}
                      </div>
                      <p className="mt-3 text-3xl font-extrabold text-dark">
                        S/{' '}
                        {Number(p.precioMensual).toLocaleString('es-PE', {
                          minimumFractionDigits: 0,
                        })}
                        <span className="text-sm font-normal text-gray-500">
                          {' '}
                          / mes
                        </span>
                      </p>
                      <p className="mt-2 text-xs text-gray-600">
                        {p.descripcion}
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-700">
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-success-600" /> Hasta{' '}
                          {p.maxLocales} locales
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-success-600" /> Hasta{' '}
                          {p.maxCanchas} canchas
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={14} className="text-success-600" /> Hasta{' '}
                          {p.maxUsuarios} usuarios
                        </li>
                      </ul>
                      <div className="mt-5 flex-1" />
                      <Button
                        variant={esActual ? 'outline' : 'primary'}
                        fullWidth
                        disabled={esActual || cambiar.isPending}
                        onClick={() => setConfirmCambiarPlan(p)}
                      >
                        {esActual ? 'Plan actual' : 'Elegir este plan'}
                      </Button>
                    </Card>
                  )
                })}
              </div>
            </section>

            {/* Historial */}
            {suscripciones && suscripciones.length > 1 && (
              <Card>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Historial de suscripciones
                </h3>
                <ul className="mt-3 divide-y divide-gray-100">
                  {suscripciones.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-dark">
                          {s.plan?.nombre ?? '—'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFecha(s.fechaInicio)} →{' '}
                          {formatFecha(s.fechaVencimiento)}
                        </p>
                      </div>
                      <Badge variant={ESTADO_VARIANT[s.estado]}>
                        {s.estado}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Confirm cambiar plan */}
      <ConfirmModal
        isOpen={!!confirmCambiarPlan}
        title={`Cambiar a plan ${confirmCambiarPlan?.nombre ?? ''}`}
        description={
          confirmCambiarPlan
            ? `Tu nueva suscripción tendrá vigencia de 30 días desde hoy. ¿Continuamos?`
            : ''
        }
        confirmLabel="Sí, cambiar plan"
        loading={cambiar.isPending}
        onConfirm={async () => {
          if (!confirmCambiarPlan) return
          await cambiar.mutateAsync({ planId: confirmCambiarPlan.id })
          setConfirmCambiarPlan(null)
        }}
        onCancel={() => setConfirmCambiarPlan(null)}
      />

      {/* Confirm cancelar */}
      <ConfirmModal
        isOpen={!!confirmCancelarId}
        title="Cancelar suscripción"
        description="Tu plan dejará de renovarse automáticamente y quedará cancelado al vencer."
        variant="danger"
        confirmLabel="Sí, cancelar"
        loading={cancelar.isPending}
        onConfirm={async () => {
          if (!confirmCancelarId) return
          await cancelar.mutateAsync(confirmCancelarId)
          setConfirmCancelarId(null)
        }}
        onCancel={() => setConfirmCancelarId(null)}
      />

      {/* Hint a Pagos */}
      {actual && (
        <div className="px-4 pb-6 sm:px-6">
          <Card className="flex items-center gap-3 border-primary-100 bg-primary-50">
            <CreditCard size={18} className="text-primary" />
            <p className="text-sm text-primary-700">
              Para registrar el pago de esta suscripción ve a{' '}
              <a
                href="/pagos-suscripcion"
                className="font-semibold underline hover:text-primary-800"
              >
                Pagos de suscripción
              </a>
              .
            </p>
          </Card>
        </div>
      )}
    </>
  )
}
