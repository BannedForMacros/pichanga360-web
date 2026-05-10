'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { LocalForm } from '@/components/locales/LocalForm'
import { LocalTable } from '@/components/locales/LocalTable'
import { useLocalesEmpresa } from '@/hooks/locales/useLocalesEmpresa'
import { useEliminarLocal } from '@/hooks/locales/useLocalesMutations'
import type { Local } from '@/types'

export default function LocalesPage() {
  const { open: openMenu } = useDashboardMenu()
  const { locales, isLoading } = useLocalesEmpresa()
  const eliminar = useEliminarLocal()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Local | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Local | null>(null)

  return (
    <>
      <Header
        title="Mis Locales"
        breadcrumb={[{ label: 'Empresa' }, { label: 'Locales' }]}
        onNew={() => {
          setEditing(undefined)
          setOpen(true)
        }}
        newLabel="+ Nuevo local"
        onOpenMenu={openMenu}
      />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <LocalTable
            locales={locales}
            onEdit={(l) => {
              setEditing(l)
              setOpen(true)
            }}
            onDelete={(l) => {
              setTarget(l)
              setConfirmOpen(true)
            }}
          />
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar local' : 'Nuevo local'}
        description="Define la ubicación física desde donde se gestionan tus canchas."
        size="lg"
      >
        <LocalForm
          local={editing}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar local"
        description={
          target
            ? `¿Eliminar "${target.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        variant="danger"
        confirmLabel="Eliminar"
        loading={eliminar.isPending}
        onConfirm={async () => {
          if (target) await eliminar.mutateAsync(target.id)
          setConfirmOpen(false)
          setTarget(null)
        }}
        onCancel={() => {
          setConfirmOpen(false)
          setTarget(null)
        }}
      />
    </>
  )
}
