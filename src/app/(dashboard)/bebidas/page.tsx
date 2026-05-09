'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { ProductoForm } from '@/components/bebidas/ProductoForm'
import { ProductoTable } from '@/components/bebidas/ProductoTable'
import { useProductosByLocal } from '@/hooks/bebidas/useProductos'
import { useEliminarProducto } from '@/hooks/bebidas/useProductosMutaciones'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import type { Producto } from '@/types'

export default function BebidasPage() {
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Producto | null>(null)

  const { data: productos, isLoading } = useProductosByLocal(localId ?? undefined)
  const eliminar = useEliminarProducto()

  return (
    <>
      <Header
        title="Bebidas / Snacks"
        breadcrumb={[{ label: 'Operación' }, { label: 'Productos' }]}
        onNew={() => {
          setEditing(undefined)
          setOpen(true)
        }}
        newLabel="+ Nuevo producto"
        onOpenMenu={openMenu}
      />
      <div className="p-4 sm:p-6">
        {loadingLocal || isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !localId ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-dark">
              Aún no tienes un local registrado
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Crea un local primero para vender productos.
            </p>
          </div>
        ) : (
          <ProductoTable
            productos={productos ?? []}
            onEdit={(p) => {
              setEditing(p)
              setOpen(true)
            }}
            onDelete={(p) => {
              setTarget(p)
              setConfirmOpen(true)
            }}
          />
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
      >
        <ProductoForm
          producto={editing}
          localId={localId ?? undefined}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar producto"
        description={target ? `¿Eliminar "${target.nombre}"?` : ''}
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
