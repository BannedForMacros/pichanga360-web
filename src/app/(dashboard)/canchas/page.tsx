'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { CanchaForm } from '@/components/canchas/CanchaForm'
import { CanchaTable } from '@/components/canchas/CanchaTable'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import { useEliminarCancha } from '@/hooks/canchas/useCanchasMutations'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import type { Cancha } from '@/types'

export default function CanchasPage() {
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const [editing, setEditing] = useState<Cancha | undefined>()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Cancha | null>(null)

  const { data: canchas, isLoading } = useCanchasByLocal(localId ?? undefined)
  const eliminar = useEliminarCancha()

  const onCreate = () => {
    setEditing(undefined)
    setOpen(true)
  }
  const onEdit = (c: Cancha) => {
    setEditing(c)
    setOpen(true)
  }
  const onDeleteAsk = (c: Cancha) => {
    setTarget(c)
    setConfirmOpen(true)
  }
  const onConfirmDelete = async () => {
    if (!target) return
    await eliminar.mutateAsync(target.id)
    setConfirmOpen(false)
    setTarget(null)
  }

  return (
    <>
      <Header
        title="Mis Canchas"
        breadcrumb={[{ label: 'Operación' }, { label: 'Canchas' }]}
        onNew={onCreate}
        newLabel="+ Nueva cancha"
        onOpenMenu={openMenu}
      />
      <div className="p-4 sm:p-6">
        {loadingLocal || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !localId ? (
          <EmptyLocal />
        ) : (
          <CanchaTable
            canchas={canchas ?? []}
            onEdit={onEdit}
            onDelete={onDeleteAsk}
          />
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar cancha' : 'Nueva cancha'}
        description="Completa los datos para gestionar reservas en esta cancha."
        size="lg"
      >
        <CanchaForm
          cancha={editing}
          localId={localId ?? undefined}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar cancha"
        description={
          target
            ? `¿Seguro que deseas eliminar "${target.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        variant="danger"
        confirmLabel="Eliminar"
        loading={eliminar.isPending}
        onConfirm={onConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setTarget(null)
        }}
      />
    </>
  )
}

function EmptyLocal() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="text-base font-semibold text-dark">
        Aún no tienes un local registrado
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Para gestionar canchas necesitas primero crear un local desde
        Configuración.
      </p>
    </div>
  )
}
