'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ProductoForm } from '@/components/bebidas/ProductoForm'
import { ProductoTable } from '@/components/bebidas/ProductoTable'
import { useEliminarProducto } from '@/hooks/bebidas/useProductosMutaciones'
import type { Producto } from '@/types'

const productosMock: Producto[] = [
  {
    id: 'p-1',
    localId: 'l-1',
    nombre: 'Gatorade 500ml',
    categoria: 'HIDRATANTE',
    precio: 6,
    stock: 24,
    activo: true,
  },
  {
    id: 'p-2',
    localId: 'l-1',
    nombre: 'Coca-Cola 500ml',
    categoria: 'BEBIDA',
    precio: 5,
    stock: 18,
    activo: true,
  },
  {
    id: 'p-3',
    localId: 'l-1',
    nombre: 'Snickers',
    categoria: 'SNACK',
    precio: 4,
    stock: 12,
    activo: true,
  },
  {
    id: 'p-4',
    localId: 'l-1',
    nombre: 'Empanada de carne',
    categoria: 'COMIDA',
    precio: 8,
    stock: 6,
    activo: true,
  },
  {
    id: 'p-5',
    localId: 'l-1',
    nombre: 'Agua sin gas 500ml',
    categoria: 'BEBIDA',
    precio: 3,
    stock: 0,
    activo: false,
  },
]

export default function BebidasPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Producto | null>(null)
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
      />
      <div className="p-6">
        <ProductoTable
          productos={productosMock}
          onEdit={(p) => {
            setEditing(p)
            setOpen(true)
          }}
          onDelete={(p) => {
            setTarget(p)
            setConfirmOpen(true)
          }}
        />
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
      >
        <ProductoForm
          producto={editing}
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
