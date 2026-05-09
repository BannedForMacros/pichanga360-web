'use client'

import { useMemo } from 'react'
import { CalendarDays, Wallet, Goal, BarChart3 } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { TablaReservas } from '@/components/reservas/TablaReservas'
import { Spinner } from '@/components/ui/Spinner'
import { useReservas } from '@/hooks/reservas/useReservas'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import type { Reserva } from '@/types'

function isMismaDia(iso: string, ref: Date) {
  const d = new Date(iso)
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  )
}

function isMismoMes(iso: string, ref: Date) {
  const d = new Date(iso)
  return (
    d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
  )
}

export default function DashboardPage() {
  const { open } = useDashboardMenu()
  const { data: me } = useUsuarioActual()
  const { localId } = useLocalActual()

  const { data: reservasResp, isLoading } = useReservas({
    localId: localId ?? undefined,
    limit: 100,
  })
  const { data: canchas } = useCanchasByLocal(localId ?? undefined)

  const reservas: Reserva[] = reservasResp?.data ?? []

  const stats = useMemo(() => {
    const hoy = new Date()
    const reservasHoy = reservas.filter(
      (r) => isMismaDia(r.fechaInicio, hoy) && r.estado !== 'CANCELADA'
    ).length

    const mes = reservas.filter(
      (r) => isMismoMes(r.fechaInicio, hoy) && r.estado !== 'CANCELADA'
    )
    const ingresosMes = mes.reduce((acc, r) => {
      const m = r.pagos?.reduce((a, p) => a + Number(p.monto ?? 0), 0) ?? 0
      return acc + m
    }, 0)

    const totalCanchas = canchas?.length ?? 0
    const activas = canchas?.filter((c) => c.estado === 'ACTIVA').length ?? 0

    const ocupacion =
      totalCanchas > 0
        ? Math.round(
            (reservasHoy / Math.max(totalCanchas * 12, 1)) * 100
          )
        : 0

    return { reservasHoy, ingresosMes, activas, totalCanchas, ocupacion }
  }, [reservas, canchas])

  const recientes = useMemo(
    () =>
      [...reservas]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .slice(0, 10),
    [reservas]
  )

  const nombre = me?.user?.nombre ?? ''

  return (
    <>
      <Header
        title="Dashboard"
        breadcrumb={[
          { label: nombre ? `Hola, ${nombre}` : 'Hola' },
          { label: 'Resumen general' },
        ]}
        range="Esta semana"
        onOpenMenu={open}
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Reservas hoy"
                value={String(stats.reservasHoy)}
                subtitle="confirmadas + pendientes"
                icon={<CalendarDays size={18} />}
                color="primary"
              />
              <MetricCard
                title="Ingresos del mes"
                value={
                  stats.ingresosMes > 0
                    ? `S/ ${stats.ingresosMes.toFixed(2)}`
                    : 'S/ 0.00'
                }
                subtitle="basado en pagos registrados"
                icon={<Wallet size={18} />}
                color="success"
              />
              <MetricCard
                title="Canchas activas"
                value={`${stats.activas} / ${stats.totalCanchas}`}
                subtitle={
                  stats.totalCanchas > 0
                    ? 'operando ahora'
                    : 'sin canchas registradas'
                }
                icon={<Goal size={18} />}
                color="primary"
              />
              <MetricCard
                title="Ocupación estimada"
                value={`${stats.ocupacion}%`}
                subtitle="reservas hoy / capacidad"
                icon={<BarChart3 size={18} />}
                color="warning"
              />
            </section>

            <TablaReservas reservas={recientes} />
          </>
        )}
      </div>
    </>
  )
}
