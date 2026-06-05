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
import type { DiaSemana, Reserva } from '@/types'

// La app opera en Perú (UTC-5, sin DST). Para saber qué día de la semana es
// "hoy" en Perú restamos 5h y usamos getUTCDay(); así no dependemos de la TZ
// del navegador. Mismo criterio que el backend (diaSemanaPeru).
const PE_OFFSET_MS = 5 * 60 * 60 * 1000
const DIA_SEMANA_BY_INDEX: DiaSemana[] = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIERCOLES',
  'JUEVES',
  'VIERNES',
  'SABADO',
]

function diaSemanaPeru(ref: Date): DiaSemana {
  const local = new Date(ref.getTime() - PE_OFFSET_MS)
  return DIA_SEMANA_BY_INDEX[local.getUTCDay()]
}

/** "HH:mm" → horas decimales (ej. "08:30" → 8.5). Inválido → 0. */
function horaADecimal(hhmm: string | undefined | null): number {
  if (!hhmm) return 0
  const [h, m] = hhmm.split(':')
  const horas = Number(h)
  const minutos = Number(m)
  if (Number.isNaN(horas) || Number.isNaN(minutos)) return 0
  return horas + minutos / 60
}

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
      (r) =>
        isMismaDia(r.fechaInicio, hoy) &&
        !['CANCELADA', 'NO_SHOW'].includes(r.estado)
    ).length

    const mes = reservas.filter(
      (r) =>
        isMismoMes(r.fechaInicio, hoy) &&
        !['CANCELADA', 'NO_SHOW'].includes(r.estado)
    )
    // Solo dinero realmente cobrado: pagos en estado PAGADO. Excluye los
    // PENDIENTE (el cliente aún no paga) y los DEVUELTO (reembolsos).
    const ingresosMes = mes.reduce((acc, r) => {
      const m =
        r.pagos?.reduce(
          (a, p) => a + (p.estado === 'PAGADO' ? Number(p.monto ?? 0) : 0),
          0
        ) ?? 0
      return acc + m
    }, 0)

    const totalCanchas = canchas?.length ?? 0
    const canchasActivas = canchas?.filter((c) => c.estado === 'ACTIVA') ?? []
    const activas = canchasActivas.length

    // Ocupación de hoy: horas efectivamente reservadas vs. horas operativas
    // REALES de hoy. Por cada cancha activa sumamos (cierre − apertura) del
    // horario que coincide con el día de semana de hoy en Perú; si la cancha
    // no atiende hoy, aporta 0. Usa la duración real de cada reserva en lugar
    // de contarlas como bloques de 1h.
    const diaHoy = diaSemanaPeru(hoy)
    const horasReservadasHoy = reservas
      .filter(
        (r) =>
          isMismaDia(r.fechaInicio, hoy) &&
          !['CANCELADA', 'NO_SHOW'].includes(r.estado)
      )
      .reduce((acc, r) => {
        const ini = new Date(r.fechaInicio).getTime()
        const fin = new Date(r.fechaFin).getTime()
        const horas = (fin - ini) / 3_600_000
        return acc + (horas > 0 ? horas : 0)
      }, 0)
    // Horas operativas reales de hoy = Σ (cierre − apertura) del horario de hoy
    // de cada cancha activa. Canchas sin horario hoy aportan 0.
    const horasOperativasHoy = canchasActivas.reduce((acc, c) => {
      const horarioHoy = c.horarios?.find((h) => h.diaSemana === diaHoy)
      if (!horarioHoy) return acc
      const horas =
        horaADecimal(horarioHoy.horaCierre) -
        horaADecimal(horarioHoy.horaApertura)
      return acc + (horas > 0 ? horas : 0)
    }, 0)
    const horasDisponibles = Math.max(horasOperativasHoy, 1)
    const ocupacion =
      horasOperativasHoy > 0
        ? Math.min(100, Math.round((horasReservadasHoy / horasDisponibles) * 100))
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
                subtitle="cobrado este mes"
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
                subtitle="horas reservadas hoy / capacidad"
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
