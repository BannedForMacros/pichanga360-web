'use client'

import { useState } from 'react'
import { Pencil, Tag, Trash2, Users } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { TipoCanchaForm } from '@/components/tipos-cancha/TipoCanchaForm'
import { useTiposCancha } from '@/hooks/catalogos/useTiposCancha'
import { useDeportes } from '@/hooks/catalogos/useDeportes'
import { useEliminarTipoCancha } from '@/hooks/catalogos/useTiposCanchaMutations'
import type { TipoCancha } from '@/types'

export default function TiposCanchaPage() {
  const { open: openMenu } = useDashboardMenu()
  const { data: tipos, isLoading } = useTiposCancha()
  const { data: deportes } = useDeportes()
  const eliminar = useEliminarTipoCancha()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TipoCancha | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<TipoCancha | null>(null)

  const deportePorId = new Map((deportes ?? []).map((d) => [d.id, d]))

  return (
    <>
      <Header
        title="Tipos de cancha"
        breadcrumb={[{ label: 'Operación' }, { label: 'Tipos de cancha' }]}
        onNew={() => {
          setEditing(undefined)
          setOpen(true)
        }}
        newLabel="+ Nuevo tipo"
        onOpenMenu={openMenu}
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_300px]">
        <Card className="p-0">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-base font-semibold text-dark">
              Catálogo de tipos
            </h3>
            <p className="text-xs text-gray-500">
              Plantillas que usas al crear cada cancha física.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : !tipos || tipos.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm font-semibold text-dark">
                Aún no defines tipos de cancha
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Crea uno con "+ Nuevo tipo". Por ejemplo: "Fútbol 7" con 14
                jugadores. Después podrás reutilizarlo al registrar canchas.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Deporte</th>
                  <th className="px-5 py-3">Capacidad</th>
                  <th className="px-5 py-3">Descripción</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tipos.map((t) => {
                  const dep = deportePorId.get(t.deporteId) ?? t.deporte
                  return (
                    <tr
                      key={t.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
                            <Tag size={16} />
                          </span>
                          <span className="font-semibold text-dark">
                            {t.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {dep?.nombre ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <Users size={12} className="text-gray-400" />
                          {t.capacidadDefault} jug.
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        <span className="line-clamp-1 max-w-xs">
                          {t.descripcion ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditing(t)
                              setOpen(true)
                            }}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary"
                            aria-label="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setTarget(t)
                              setConfirmOpen(true)
                            }}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-dark">¿Para qué sirve?</h3>
          <ul className="mt-3 space-y-3 text-sm text-gray-700">
            <li>
              Cada <strong className="text-dark">cancha física</strong> que
              registres elige un tipo de esta lista.
            </li>
            <li>
              El tipo define el <strong>deporte</strong> y la{' '}
              <strong>capacidad por defecto</strong> de jugadores.
            </li>
            <li>
              También puedes asignar tarifas al tipo (ej. precio normal de
              "Fútbol 7"), y todas las canchas de ese tipo las heredan.
            </li>
          </ul>
        </Card>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar tipo de cancha' : 'Nuevo tipo de cancha'}
        size="md"
      >
        <TipoCanchaForm
          tipo={editing}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar tipo de cancha"
        description={
          target
            ? `¿Eliminar "${target.nombre}"? Las canchas que lo usan quedarán sin tipo asignado.`
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
