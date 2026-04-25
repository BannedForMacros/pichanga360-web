'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Cancha, EstadoCancha } from '@/types'

interface Props {
  canchas: Cancha[]
  onEdit?: (c: Cancha) => void
  onDelete?: (c: Cancha) => void
}

const estadoVariant: Record<
  EstadoCancha,
  { label: string; variant: 'success' | 'warning' | 'danger' }
> = {
  ACTIVA: { label: 'Activa', variant: 'success' },
  INACTIVA: { label: 'Inactiva', variant: 'danger' },
  MANTENIMIENTO: { label: 'Mantenimiento', variant: 'warning' },
}

export function CanchaTable({ canchas, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Cancha</th>
            <th className="px-4 py-3">Deporte</th>
            <th className="px-4 py-3">Superficie</th>
            <th className="px-4 py-3">Capacidad</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {canchas.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                No hay canchas registradas todavía.
              </td>
            </tr>
          ) : (
            canchas.map((c) => {
              const estado = estadoVariant[c.estado]
              return (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-semibold text-dark">{c.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{c.deporte}</td>
                  <td className="px-4 py-3 text-gray-700">{c.superficie}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.capacidadJugadores}
                  </td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {formatCurrency(c.precioPorHora)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={estado.variant}>{estado.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Pencil size={14} />}
                        onClick={() => onEdit?.(c)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => onDelete?.(c)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
