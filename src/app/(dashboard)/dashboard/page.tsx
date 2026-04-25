import { CalendarDays, Wallet, Goal, BarChart3 } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { MetricCard } from '@/components/dashboard/MetricCard'
import {
  CalendarioSemanal,
  type FilaCancha,
} from '@/components/reservas/CalendarioSemanal'
import { TablaReservas, type ReservaRow } from '@/components/reservas/TablaReservas'

const filas: FilaCancha[] = [
  {
    canchaId: 'c-1',
    canchaNombre: 'Cancha 1 — La Bombonera',
    celdas: [
      { estado: 'CONFIRMADO', cliente: 'Luis Quispe', monto: 120 },
      { estado: 'LIBRE' },
      { estado: 'PENDIENTE', cliente: 'María Vargas' },
      { estado: 'CONFIRMADO', cliente: 'Carlos Ramírez', monto: 120 },
      { estado: 'CONFIRMADO', cliente: 'Equipo Real Lima', monto: 120 },
      { estado: 'PENDIENTE', cliente: 'Diego Chávez' },
      { estado: 'LIBRE' },
    ],
  },
  {
    canchaId: 'c-2',
    canchaNombre: 'Cancha 2 — Sintética',
    celdas: [
      { estado: 'LIBRE' },
      { estado: 'CONFIRMADO', cliente: 'Andrea Tello', monto: 90 },
      { estado: 'CONFIRMADO', cliente: 'Pichangueros FC', monto: 90 },
      { estado: 'LIBRE' },
      { estado: 'CONFIRMADO', cliente: 'Gabriela Soto', monto: 90 },
      { estado: 'CONFIRMADO', cliente: 'Equipo San Borja', monto: 90 },
      { estado: 'PENDIENTE', cliente: 'Renato Lazo' },
    ],
  },
  {
    canchaId: 'c-3',
    canchaNombre: 'Cancha 3 — Vóley',
    celdas: [
      { estado: 'CONFIRMADO', cliente: 'Vóley San Isidro', monto: 70 },
      { estado: 'CONFIRMADO', cliente: 'Academia Olimpia', monto: 70 },
      { estado: 'LIBRE' },
      { estado: 'PENDIENTE', cliente: 'Camila Ríos' },
      { estado: 'LIBRE' },
      { estado: 'CONFIRMADO', cliente: 'Rocío Mendoza', monto: 70 },
      { estado: 'CONFIRMADO', cliente: 'Equipo Magdalena', monto: 70 },
    ],
  },
  {
    canchaId: 'c-4',
    canchaNombre: 'Cancha 4 — Básquet',
    celdas: [
      { estado: 'PENDIENTE', cliente: 'Universidad SMP' },
      { estado: 'LIBRE' },
      { estado: 'CONFIRMADO', cliente: 'Sebastián Vega', monto: 80 },
      { estado: 'CONFIRMADO', cliente: 'Alianza Hoops', monto: 80 },
      { estado: 'LIBRE' },
      { estado: 'CONFIRMADO', cliente: 'Diego Otoya', monto: 80 },
      { estado: 'LIBRE' },
    ],
  },
]

const reservas: ReservaRow[] = [
  {
    id: 'r-1',
    clienteNombre: 'Luis Quispe',
    clienteEmail: 'luis.quispe@gmail.com',
    cancha: 'Cancha 1 — La Bombonera',
    fecha: '21 abr 2026',
    horario: '19:00 — 20:00',
    monto: 120,
    estado: 'CONFIRMADA',
  },
  {
    id: 'r-2',
    clienteNombre: 'María Vargas',
    clienteEmail: 'maria.vargas@hotmail.com',
    cancha: 'Cancha 1 — La Bombonera',
    fecha: '23 abr 2026',
    horario: '20:00 — 21:00',
    monto: 120,
    estado: 'PENDIENTE',
  },
  {
    id: 'r-3',
    clienteNombre: 'Andrea Tello',
    clienteEmail: 'andrea.tello@outlook.com',
    cancha: 'Cancha 2 — Sintética',
    fecha: '22 abr 2026',
    horario: '21:00 — 22:00',
    monto: 90,
    estado: 'CONFIRMADA',
  },
  {
    id: 'r-4',
    clienteNombre: 'Sebastián Vega',
    clienteEmail: 'svega@gmail.com',
    cancha: 'Cancha 4 — Básquet',
    fecha: '23 abr 2026',
    horario: '18:00 — 19:00',
    monto: 80,
    estado: 'CONFIRMADA',
  },
  {
    id: 'r-5',
    clienteNombre: 'Diego Chávez',
    clienteEmail: 'diego.chavez@gmail.com',
    cancha: 'Cancha 1 — La Bombonera',
    fecha: '26 abr 2026',
    horario: '20:00 — 21:00',
    monto: 120,
    estado: 'PENDIENTE',
  },
]

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        breadcrumb={[
          { label: 'Hola, Roberto' },
          { label: 'Sport Center San Isidro' },
        ]}
        range="Esta semana"
        onNew={() => {}}
        newLabel="+ Nueva reserva"
      />
      <div className="flex flex-col gap-6 p-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Reservas hoy"
            value="18"
            subtitle="vs ayer (16)"
            trend={12}
            icon={<CalendarDays size={18} />}
            color="primary"
            series={[5, 7, 6, 8, 12, 14, 18]}
          />
          <MetricCard
            title="Ingresos del mes"
            value="S/ 14,820"
            subtitle="vs mes anterior"
            trend={12}
            icon={<Wallet size={18} />}
            color="success"
            series={[3, 4, 5, 6, 8, 10, 14]}
          />
          <MetricCard
            title="Canchas activas"
            value="4 / 4"
            subtitle="todas operando"
            trend={0}
            icon={<Goal size={18} />}
            color="primary"
            series={[4, 4, 4, 4, 4, 4, 4]}
          />
          <MetricCard
            title="Ocupación"
            value="78%"
            subtitle="vs semana anterior"
            trend={6}
            icon={<BarChart3 size={18} />}
            color="warning"
            series={[60, 64, 68, 71, 73, 75, 78]}
          />
        </section>

        <CalendarioSemanal filas={filas} />

        <TablaReservas reservas={reservas} />
      </div>
    </>
  )
}
