'use client'

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
import { Wallet, TrendingUp, Goal } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/dashboard/MetricCard'

const ingresosSemana = [
  { dia: 'Lun', ingresos: 1850 },
  { dia: 'Mar', ingresos: 2100 },
  { dia: 'Mié', ingresos: 1980 },
  { dia: 'Jue', ingresos: 2350 },
  { dia: 'Vie', ingresos: 2800 },
  { dia: 'Sáb', ingresos: 3100 },
  { dia: 'Dom', ingresos: 2640 },
]

const ocupacion = [
  { name: 'Fútbol', value: 52 },
  { name: 'Básquet', value: 18 },
  { name: 'Vóley', value: 16 },
  { name: 'Tenis', value: 14 },
]

const colors = ['#1B3F72', '#F5A623', '#00A86B', '#7C3AED']

export default function ReportesPage() {
  return (
    <>
      <Header
        title="Reportes"
        breadcrumb={[{ label: 'Operación' }, { label: 'Reportes' }]}
      />
      <div className="flex flex-col gap-6 p-6">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Ingresos esta semana"
            value="S/ 16,820"
            subtitle="vs. semana anterior"
            trend={9}
            icon={<Wallet size={18} />}
            color="success"
            series={[1500, 1700, 1900, 2100, 2400, 2700, 3000]}
          />
          <MetricCard
            title="Reservas totales"
            value="184"
            subtitle="reservas registradas"
            trend={14}
            icon={<TrendingUp size={18} />}
            color="primary"
            series={[12, 16, 18, 22, 28, 32, 36]}
          />
          <MetricCard
            title="Cancha top"
            value="Cancha 1"
            subtitle="42 reservas esta semana"
            trend={4}
            icon={<Goal size={18} />}
            color="warning"
            series={[3, 4, 5, 5, 6, 7, 8]}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <h3 className="text-base font-semibold text-dark">
              Ingresos por día
            </h3>
            <p className="text-xs text-gray-500">Última semana</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingresosSemana}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                    formatter={(v) => [`S/ ${Number(v)}`, 'Ingresos']}
                  />
                  <Bar dataKey="ingresos" radius={[8, 8, 0, 0]} fill="#1B3F72" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-dark">
              Ocupación por deporte
            </h3>
            <p className="text-xs text-gray-500">Distribución de reservas</p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ocupacion}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {ocupacion.map((_, idx) => (
                      <Cell key={idx} fill={colors[idx % colors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v) => [`${Number(v)}%`, 'Ocupación']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>
      </div>
    </>
  )
}
