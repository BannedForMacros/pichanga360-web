'use client'

import { Mail, Phone } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Usuario } from '@/types'

interface Props {
  clientes: Usuario[]
}

export function ClienteTable({ clientes }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3">Registrado</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Estado</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                Aún no tienes clientes registrados.
              </td>
            </tr>
          ) : (
            clientes.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${c.nombre} ${c.apellido}`} size="sm" />
                    <div>
                      <p className="font-semibold text-dark">
                        {c.nombre} {c.apellido}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {c.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <p className="flex items-center gap-1 text-xs">
                    <Mail size={12} className="text-gray-400" />
                    {c.email}
                  </p>
                  {c.telefono && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs">
                      <Phone size={12} className="text-gray-400" />
                      {c.telefono}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.emailVerificado ? 'success' : 'warning'}>
                    {c.emailVerificado ? 'Verificado' : 'Sin verificar'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.activo ? 'success' : 'neutral'}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
