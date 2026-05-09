'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { ReservaForm } from '@/components/reservas/ReservaForm'
import { TablaReservas } from '@/components/reservas/TablaReservas'
import { useReservas } from '@/hooks/reservas/useReservas'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import { useLocalActual } from '@/hooks/auth/useLocalActual'

export default function ReservasPage() {
  const [open, setOpen] = useState(false)
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const { data: reservasResp, isLoading } = useReservas({
    localId: localId ?? undefined,
    limit: 50,
  })
  const { data: canchas } = useCanchasByLocal(localId ?? undefined)

  return (
    <>
      <Header
        title="Reservas"
        breadcrumb={[{ label: 'Operación' }, { label: 'Reservas' }]}
        onNew={() => setOpen(true)}
        newLabel="+ Nueva reserva"
        onOpenMenu={openMenu}
      />
      <div className="p-4 sm:p-6">
        {loadingLocal || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <TablaReservas reservas={reservasResp?.data ?? []} />
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Nueva reserva"
        description="Asigna una cancha y un horario."
        size="lg"
      >
        <ReservaForm
          canchas={canchas ?? []}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  )
}
