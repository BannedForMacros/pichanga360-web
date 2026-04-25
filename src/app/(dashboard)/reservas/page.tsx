'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Modal } from '@/components/ui/Modal'
import { ReservaForm } from '@/components/reservas/ReservaForm'
import {
  TablaReservas,
  type ReservaRow,
} from '@/components/reservas/TablaReservas'

const canchas = [
  { id: 'c-1', nombre: 'Cancha 1 — La Bombonera' },
  { id: 'c-2', nombre: 'Cancha 2 — Sintética' },
  { id: 'c-3', nombre: 'Cancha 3 — Vóley' },
  { id: 'c-4', nombre: 'Cancha 4 — Básquet' },
]

const clientes = [
  { id: 'u-1', nombre: 'Luis', apellido: 'Quispe' },
  { id: 'u-2', nombre: 'María', apellido: 'Vargas' },
  { id: 'u-3', nombre: 'Andrea', apellido: 'Tello' },
  { id: 'u-4', nombre: 'Sebastián', apellido: 'Vega' },
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
    estado: 'COMPLETADA',
  },
]

export default function ReservasPage() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Header
        title="Reservas"
        breadcrumb={[{ label: 'Operación' }, { label: 'Reservas' }]}
        onNew={() => setOpen(true)}
        newLabel="+ Nueva reserva"
      />
      <div className="p-6">
        <TablaReservas reservas={reservas} />
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Nueva reserva"
        description="Asigna un cliente, una cancha y un horario."
        size="lg"
      >
        <ReservaForm
          canchas={canchas}
          clientes={clientes}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
