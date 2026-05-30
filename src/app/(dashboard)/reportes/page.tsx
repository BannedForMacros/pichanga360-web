'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { CalendarCheck, TrendingUp, Goal } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import { useReservas } from '@/hooks/reservas/useReservas'
import type { Cancha, Reserva } from '@/types'

const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const COLORS = ['#1B3F72', '#F5A623', '#00A86B', '#7C3AED', '#EF4444', '#0EA5E9']

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function diffDias(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ReportesPage() {
  const { open } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const hoy = startOfDay(new Date())
  const hace7 = new Date(hoy)
  hace7.setDate(hace7.getDate() - 6)

  const { data: reservasResp, isLoading: loadingReservas } = useReservas({
    localId: localId ?? undefined,
    desde: hace7.toISOString(),
    hasta: new Date(hoy.getTime() + 24 * 3600 * 1000).toISOString(),
    limit: 100,
  })
  const { data: canchas } = useCanchasByLocal(localId ?? undefined)

  const reservas: Reserva[] = reservasResp?.data ?? []

  const stats = useMemo(() => {
    // 7 días con su key (día numérico 0=domingo) en orden cronológico
    const buckets: { fecha: Date; key: string; count: number; label: string }[] =
      []
    for (let i = 6; i >= 0; i--) {
      const f = new Date(hoy)
      f.setDate(f.getDate() - i)
      buckets.push({
        fecha: f,
        key: f.toISOString().slice(0, 10),
        count: 0,
        label: DIAS_CORTOS[f.getDay()],
      })
    }

    // Conteo por día (excluye canceladas)
    let totalReservas = 0
    const reservasPorCancha = new Map<string, number>()
    const reservasPorDeporte = new Map<string, number>()

    const canchaById = new Map<string, Cancha>()
    for (const c of canchas ?? []) canchaById.set(c.id, c)

    for (const r of reservas) {
      if (['CANCELADA', 'NO_SHOW'].includes(r.estado)) continue
      const f = startOfDay(new Date(r.fechaInicio))
      const idx = 6 - diffDias(hoy, f)
      if (idx >= 0 && idx < 7) {
        buckets[idx].count++
      }
      totalReservas++

      reservasPorCancha.set(
        r.canchaId,
        (reservasPorCancha.get(r.canchaId) ?? 0) + 1,
      )

      const c = r.cancha as Cancha | undefined
      // El endpoint /reservas devuelve cancha con select básico (sin tipoCancha)
      // así que enriquecemos con la lista de canchas del local
      const enriched = canchaById.get(r.canchaId) ?? c
      const deporte = enriched?.tipoCancha?.deporte?.nombre ?? 'Sin clasificar'
      reservasPorDeporte.set(
        deporte,
        (reservasPorDeporte.get(deporte) ?? 0) + 1,
      )
    }

    // Cancha top
    let canchaTopId: string | null = null
    let canchaTopCount = 0
    for (const [id, n] of reservasPorCancha) {
      if (n > canchaTopCount) {
        canchaTopId = id
        canchaTopCount = n
      }
    }
    const canchaTop = canchaTopId ? canchaById.get(canchaTopId) ?? null : null

    const ocupacion = Array.from(reservasPorDeporte.entries()).map(
      ([name, value]) => ({ name, value }),
    )

    const reservasPorDia = buckets.map((b) => ({
      dia: b.label,
      reservas: b.count,
    }))

    const series = buckets.map((b) => b.count)

    return {
      totalReservas,
      canchaTop,
      canchaTopCount,
      reservasPorDia,
      ocupacion,
      series,
    }
  }, [reservas, canchas, hoy])

  const isLoading = loadingLocal || loadingReservas

  return (
    <>
      <Header
        title="Reportes"
        breadcrumb={[{ label: 'Operación' }, { label: 'Reportes' }]}
        onOpenMenu={open}
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !localId ? (
          <Card>
            <p className="text-base font-semibold text-dark">
              Aún no tienes un local registrado
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Crea un local para empezar a ver reportes operativos.
            </p>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Reservas esta semana"
                value={String(stats.totalReservas)}
                subtitle="últimos 7 días, sin canceladas"
                icon={<CalendarCheck size={18} />}
                color="primary"
                series={stats.series}
              />
              <MetricCard
                title="Promedio diario"
                value={(stats.totalReservas / 7).toFixed(1)}
                subtitle="reservas por día"
                icon={<TrendingUp size={18} />}
                color="success"
                series={stats.series}
              />
              <MetricCard
                title="Cancha top"
                value={stats.canchaTop?.nombre ?? '—'}
                subtitle={
                  stats.canchaTop
                    ? `${stats.canchaTopCount} reservas esta semana`
                    : 'sin reservas registradas'
                }
                icon={<Goal size={18} />}
                color="warning"
                series={stats.series}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <Card>
                <h3 className="text-base font-semibold text-dark">
                  Reservas por día
                </h3>
                <p className="text-xs text-gray-500">Última semana</p>
                <div className="mt-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.reservasPorDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          fontSize: 12,
                        }}
                        formatter={(v) => [`${Number(v)}`, 'Reservas']}
                      />
                      <Bar
                        dataKey="reservas"
                        radius={[8, 8, 0, 0]}
                        fill="#1B3F72"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="text-base font-semibold text-dark">
                  Distribución por deporte
                </h3>
                <p className="text-xs text-gray-500">
                  Reservas confirmadas en la semana
                </p>
                <div className="mt-6 h-72">
                  {stats.ocupacion.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Aún no hay reservas para graficar.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.ocupacion}
                          dataKey="value"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {stats.ocupacion.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={COLORS[idx % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip
                          formatter={(v) => [`${Number(v)} reservas`, 'Cantidad']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </section>
          </>
        )}
      </div>
    </>
  )
}
