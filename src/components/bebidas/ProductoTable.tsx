'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Producto } from '@/types'

interface Props {
  productos: Producto[]
  onEdit?: (p: Producto) => void
  onDelete?: (p: Producto) => void
}

export function ProductoTable({ productos, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                Aún no tienes productos cargados.
              </td>
            </tr>
          ) : (
            productos.map((p) => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-dark">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-700">
                  {p.categoria?.nombre ?? '—'}
                </td>
                <td className="px-4 py-3 font-semibold text-primary">
                  {formatCurrency(Number(p.precio))}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      p.stock > 5 ? 'success' : p.stock > 0 ? 'warning' : 'danger'
                    }
                  >
                    {p.stock}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.activo ? 'success' : 'neutral'}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Pencil size={14} />}
                      onClick={() => onEdit?.(p)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => onDelete?.(p)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
