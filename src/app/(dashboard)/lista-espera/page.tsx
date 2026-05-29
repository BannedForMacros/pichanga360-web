'use client'

import { useMemo, useState } from 'react'
import { Phone, Trash2, Users } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { ListaEsperaForm } from '@/components/reservas/ListaEsperaForm'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import {
  useEliminarListaEspera,
  useListaEsperaByCancha,
} from '@/hooks/reservas/useListaEspera'
import { buildWhatsAppLink } from '@/lib/utils'
import type { ListaEspera } from '@/types'

function rangoHorario(inicioIso: string, finIso: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  return `${fmt(inicioIso)} – ${fmt(finIso)}`
}

function fechaLarga(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

export default function ListaEsperaPage() {
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const { data: canchas, isLoading: loadingCanchas } = useCanchasByLocal(
    localId ?? undefined,
  )
  const [seleccion, setSeleccion] = useState<string | undefined>()

  // Cancha efectiva: la elegida (si sigue existiendo) o, por defecto, la primera.
  // Derivada en render para no llamar setState dentro de un efecto.
  const canchaId =
    seleccion && canchas?.some((c) => c.id === seleccion)
      ? seleccion
      : canchas?.[0]?.id

  const cancha = canchas?.find((c) => c.id === canchaId)
  const { data: cola, isLoading: loadingCola } = useListaEsperaByCancha(canchaId)
  const eliminar = useEliminarListaEspera()

  const [target, setTarget] = useState<ListaEspera | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  // Agrupamos la cola por franja (fechaInicio + fechaFin) para que el dueño vea
  // "quién espera por este horario".
  const grupos = useMemo(() => {
    const map = new Map<string, ListaEspera[]>()
    for (const item of cola ?? []) {
      const key = `${item.fechaInicio}|${item.fechaFin}`
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return Array.from(map.entries()).map(([, items]) => ({
      fechaInicio: items[0].fechaInicio,
      fechaFin: items[0].fechaFin,
      items: items.sort((a, b) => a.posicion - b.posicion),
    }))
  }, [cola])

  const confirmarQuitar = () => {
    if (!target) return
    eliminar.mutate(target.id, { onSettled: () => setTarget(null) })
  }

  return (
    <>
      <Header
        title="Lista de espera"
        breadcrumb={[{ label: 'Operación' }, { label: 'Lista de espera' }]}
        onNew={canchas && canchas.length > 0 ? () => setFormOpen(true) : undefined}
        newLabel="+ Agregar cliente"
        onOpenMenu={openMenu}
      />

      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Card className="p-0">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-dark">
                  Clientes en espera {cancha ? `· ${cancha.nombre}` : ''}
                </h3>
                <p className="text-xs text-gray-500">
                  Si se libera un horario, contacta al primero de la cola.
                </p>
              </div>
              <div className="w-full sm:w-72">
                <SearchableSelect
                  options={(canchas ?? []).map((c) => ({
                    label: c.nombre,
                    value: c.id,
                  }))}
                  value={canchaId}
                  onChange={(v) => setSeleccion(v)}
                  placeholder="Selecciona una cancha"
                  emptyText="Sin canchas registradas"
                  loading={loadingCanchas}
                />
              </div>
            </div>
          </div>

          <div className="p-5">
            {loadingLocal || loadingCanchas ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : !localId ? (
              <p className="py-10 text-center text-sm text-gray-500">
                Aún no tienes un local registrado.
              </p>
            ) : !canchas || canchas.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">
                No tienes canchas en este local.
              </p>
            ) : loadingCola ? (
              <div className="flex items-center justify-center py-16">
                <Spinner size="md" />
              </div>
            ) : grupos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                <Users size={28} className="mx-auto text-gray-400" />
                <p className="mt-2 text-sm font-semibold text-dark">
                  No hay nadie en lista de espera
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Cuando un cliente quiera un horario ocupado, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {grupos.map((g) => (
                  <div key={`${g.fechaInicio}|${g.fechaFin}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-dark">
                        {fechaLarga(g.fechaInicio)}
                      </span>
                      <Badge variant="primary" size="sm">
                        {rangoHorario(g.fechaInicio, g.fechaFin)}
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {g.items.map((item) => {
                        const nombre = item.cliente
                          ? `${item.cliente.nombre ?? ''} ${item.cliente.apellido ?? ''}`.trim() ||
                            'Cliente'
                          : 'Cliente'
                        const tel = item.cliente?.telefono ?? null
                        const wa = buildWhatsAppLink(
                          tel,
                          `Hola ${nombre}, se liberó el horario ${rangoHorario(
                            g.fechaInicio,
                            g.fechaFin,
                          )} en ${cancha?.nombre ?? 'la cancha'}. ¿Lo quieres tomar?`,
                        )
                        return (
                          <li
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary">
                                {item.posicion}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-dark">
                                  {nombre}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                  {tel ?? 'Sin teléfono'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {wa && (
                                <a
                                  href={wa}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    leftIcon={<Phone size={14} />}
                                  >
                                    Contactar
                                  </Button>
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setTarget(item)}
                                aria-label="Quitar de la lista"
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Agregar a lista de espera"
        description="Anota a un cliente que quería un horario ocupado."
        size="lg"
      >
        <ListaEsperaForm
          canchas={(canchas ?? []).map((c) => ({ id: c.id, nombre: c.nombre }))}
          defaultCanchaId={canchaId}
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!target}
        title="Quitar de la lista de espera"
        description="El cliente dejará de aparecer en la cola de este horario. ¿Continuar?"
        confirmLabel="Quitar"
        variant="danger"
        loading={eliminar.isPending}
        onConfirm={confirmarQuitar}
        onCancel={() => setTarget(null)}
      />
    </>
  )
}
