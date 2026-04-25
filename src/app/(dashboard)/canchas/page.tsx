'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CanchaForm } from '@/components/canchas/CanchaForm'
import { CanchaTable } from '@/components/canchas/CanchaTable'
import { useEliminarCancha } from '@/hooks/canchas/useCanchasMutations'
import type { Cancha } from '@/types'

const canchasMock: Cancha[] = [
  {
    id: 'c-1',
    localId: 'l-1',
    nombre: 'Cancha 1 — La Bombonera',
    deporte: 'FUTBOL',
    superficie: 'GRASS',
    capacidadJugadores: 22,
    descripcion: 'Cancha grande, grass natural.',
    estado: 'ACTIVA',
    precioPorHora: 120,
  },
  {
    id: 'c-2',
    localId: 'l-1',
    nombre: 'Cancha 2 — Sintética',
    deporte: 'FUTBOL',
    superficie: 'SINTETICO',
    capacidadJugadores: 14,
    estado: 'ACTIVA',
    precioPorHora: 90,
  },
  {
    id: 'c-3',
    localId: 'l-1',
    nombre: 'Cancha 3 — Vóley',
    deporte: 'VOLEY',
    superficie: 'CEMENTO',
    capacidadJugadores: 12,
    estado: 'MANTENIMIENTO',
    precioPorHora: 70,
  },
  {
    id: 'c-4',
    localId: 'l-1',
    nombre: 'Cancha 4 — Básquet',
    deporte: 'BASKET',
    superficie: 'CEMENTO',
    capacidadJugadores: 10,
    estado: 'ACTIVA',
    precioPorHora: 80,
  },
]

export default function CanchasPage() {
  const [editing, setEditing] = useState<Cancha | undefined>()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Cancha | null>(null)
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
      />
      <div className="p-6">
        <CanchaTable
          canchas={canchasMock}
          onEdit={onEdit}
          onDelete={onDeleteAsk}
        />
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
