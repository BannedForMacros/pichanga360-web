'use client'

import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { StaffMiembro, StaffRolAsignacion } from '@/types/staff'

const ROL_LABEL: Record<string, string> = {
  ADMIN_EMPRESA: 'Dueño',
  ADMIN_LOCAL: 'Admin de local',
  OPERADOR: 'Operador',
}

function rolVariant(codigo: string): 'primary' | 'success' | 'warning' {
  if (codigo === 'ADMIN_EMPRESA') return 'warning'
  if (codigo === 'ADMIN_LOCAL') return 'primary'
  return 'success'
}

interface Props {
  staff: StaffMiembro[]
  /** Se llama con la asignación de rol a quitar (y el miembro dueño). */
  onQuitar: (miembro: StaffMiembro, asignacion: StaffRolAsignacion) => void
}

export function StaffTabla({ staff, onQuitar }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th className="px-4 py-3">Empleado</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rol · Local</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {staff.map((m) => {
            const nombre = `${m.nombre} ${m.apellido}`.trim() || 'Empleado'
            return (
              <tr key={m.id} className="align-top hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-dark">{nombre}</p>
                  {m.telefono && (
                    <p className="text-xs text-gray-500">{m.telefono}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1.5">
                    {m.roles.map((r) => {
                      const esDueno = r.rol.codigo === 'ADMIN_EMPRESA'
                      return (
                        <div
                          key={r.id}
                          className="flex flex-wrap items-center gap-2"
                        >
                          <Badge variant={rolVariant(r.rol.codigo)} size="sm">
                            {ROL_LABEL[r.rol.codigo] ?? r.rol.codigo}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {r.local?.nombre ??
                              (esDueno ? 'Toda la empresa' : 'Sin local')}
                          </span>
                          {!esDueno && (
                            <button
                              type="button"
                              onClick={() => onQuitar(m, r)}
                              className="text-gray-400 hover:text-red-500"
                              aria-label="Quitar este rol"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={m.activo ? 'success' : 'neutral'} size="sm">
                    {m.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {m.roles.some((r) => r.rol.codigo !== 'ADMIN_EMPRESA') ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const quitable = m.roles.find(
                          (r) => r.rol.codigo !== 'ADMIN_EMPRESA',
                        )
                        if (quitable) onQuitar(m, quitable)
                      }}
                      aria-label="Quitar acceso"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
