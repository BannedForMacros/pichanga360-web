'use client'

import { Building, MapPin, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Local } from '@/types'

interface Props {
  locales: Local[]
  onEdit?: (l: Local) => void
  onDelete?: (l: Local) => void
}

export function LocalTable({ locales, onEdit, onDelete }: Props) {
  if (locales.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-base font-semibold text-dark">
          Aún no tienes locales registrados
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Crea tu primer local con el botón “+ Nuevo local”.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-5 py-3">Local</th>
            <th className="px-5 py-3">Dirección</th>
            <th className="px-5 py-3">Distrito</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {locales.map((l) => (
            <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
                    <Building size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-dark">{l.nombre}</p>
                    <p className="truncate text-xs text-gray-500">
                      {l.canchas?.length ?? 0} canchas
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-gray-700">
                <span className="flex items-start gap-1">
                  <MapPin size={12} className="mt-1 text-gray-400" />
                  <span>
                    {l.calle} {l.numero}
                  </span>
                </span>
              </td>
              <td className="px-5 py-3 text-gray-700">
                {l.distrito} · {l.provincia}
              </td>
              <td className="px-5 py-3">
                <Badge variant={l.activo ? 'success' : 'neutral'}>
                  {l.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(l)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(l)}
                      className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
