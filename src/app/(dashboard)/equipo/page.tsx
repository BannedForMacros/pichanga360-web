'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { OperadorForm } from '@/components/equipo/OperadorForm'
import { StaffTabla } from '@/components/equipo/StaffTabla'
import { useQuitarRol, useStaff } from '@/hooks/usuarios/useStaff'
import type { StaffMiembro, StaffRolAsignacion } from '@/types/staff'

interface QuitarTarget {
  miembro: StaffMiembro
  asignacion: StaffRolAsignacion
}

export default function EquipoPage() {
  const { open: openMenu } = useDashboardMenu()
  const { data: staff, isLoading } = useStaff()
  const quitar = useQuitarRol()

  const [formOpen, setFormOpen] = useState(false)
  const [target, setTarget] = useState<QuitarTarget | null>(null)

  const confirmarQuitar = () => {
    if (!target) return
    quitar.mutate(
      {
        usuarioId: target.miembro.id,
        asignacionId: target.asignacion.id,
      },
      { onSettled: () => setTarget(null) },
    )
  }

  const nombreTarget = target
    ? `${target.miembro.nombre} ${target.miembro.apellido}`.trim() || 'el empleado'
    : ''

  return (
    <>
      <Header
        title="Equipo"
        breadcrumb={[{ label: 'General' }, { label: 'Equipo' }]}
        onNew={() => setFormOpen(true)}
        newLabel="+ Agregar operador"
        onOpenMenu={openMenu}
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Card className="p-0">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-semibold text-dark">
              Operadores y administradores
            </h3>
            <p className="text-xs text-gray-500">
              Crea cuentas para tu personal y dales acceso a un local.
            </p>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : !staff || staff.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <Users size={28} className="mx-auto text-gray-400" />
                <p className="mt-2 text-sm font-semibold text-dark">
                  Aún no tienes empleados
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Agrega operadores o administradores para delegar la gestión de
                  tus locales.
                </p>
              </div>
            ) : (
              <StaffTabla
                staff={staff}
                onQuitar={(miembro, asignacion) =>
                  setTarget({ miembro, asignacion })
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Agregar operador"
        description="Crea una cuenta para un empleado y asígnale un rol en un local."
        size="lg"
      >
        <OperadorForm
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!target}
        title="Quitar acceso del equipo"
        description={`${nombreTarget} dejará de tener este rol y acceso al local. ¿Continuar?`}
        confirmLabel="Quitar"
        variant="danger"
        loading={quitar.isPending}
        onConfirm={confirmarQuitar}
        onCancel={() => setTarget(null)}
      />
    </>
  )
}
