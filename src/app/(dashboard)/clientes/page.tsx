import { Header } from '@/components/dashboard/Header'
import { ClienteTable } from '@/components/clientes/ClienteTable'
import type { Usuario } from '@/types'

const clientes: (Usuario & { totalReservas?: number; totalGastado?: number })[] = [
  {
    id: 'u-1',
    nombre: 'Luis',
    apellido: 'Quispe',
    email: 'luis.quispe@gmail.com',
    telefono: '987654321',
    fechaCreacion: '2025-09-12',
    activo: true,
    totalReservas: 32,
    totalGastado: 3840,
  },
  {
    id: 'u-2',
    nombre: 'María',
    apellido: 'Vargas',
    email: 'maria.vargas@hotmail.com',
    telefono: '912345678',
    fechaCreacion: '2025-11-04',
    activo: true,
    totalReservas: 18,
    totalGastado: 2160,
  },
  {
    id: 'u-3',
    nombre: 'Andrea',
    apellido: 'Tello',
    email: 'andrea.tello@outlook.com',
    telefono: '923456789',
    fechaCreacion: '2025-12-21',
    activo: true,
    totalReservas: 12,
    totalGastado: 1080,
  },
  {
    id: 'u-4',
    nombre: 'Sebastián',
    apellido: 'Vega',
    email: 'svega@gmail.com',
    telefono: '976543210',
    fechaCreacion: '2026-01-15',
    activo: true,
    totalReservas: 9,
    totalGastado: 720,
  },
  {
    id: 'u-5',
    nombre: 'Diego',
    apellido: 'Chávez',
    email: 'diego.chavez@gmail.com',
    fechaCreacion: '2026-02-02',
    activo: false,
    totalReservas: 4,
    totalGastado: 480,
  },
]

export default function ClientesPage() {
  return (
    <>
      <Header
        title="Clientes"
        breadcrumb={[{ label: 'Operación' }, { label: 'Clientes' }]}
      />
      <div className="p-6">
        <ClienteTable clientes={clientes} />
      </div>
    </>
  )
}
