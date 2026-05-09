'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { HorarioForm } from '@/components/horarios/HorarioForm'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import {
  useEliminarHorario,
  useHorariosByCancha,
} from '@/hooks/horarios/useHorarios'
import { useTarifasByCancha } from '@/hooks/tarifas/useTarifas'
import {
  DIAS_LABEL,
  DIAS_SEMANA,
} from '@/validators/horarios/horario.schema'
import type { DiaSemana, HorarioCancha } from '@/types'

export default function HorariosPage() {
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const { data: canchas, isLoading: loadingCanchas } =
    useCanchasByLocal(localId ?? undefined)

  const [canchaId, setCanchaId] = useState<string | undefined>()

  // Auto-seleccionamos la primera cancha cuando cambia el local
  useEffect(() => {
    if (!canchas || canchas.length === 0) {
      setCanchaId(undefined)
      return
    }
    if (!canchaId || !canchas.some((c) => c.id === canchaId)) {
      setCanchaId(canchas[0].id)
    }
  }, [canchas, canchaId])

  const cancha = canchas?.find((c) => c.id === canchaId)

  const { data: horarios, isLoading: loadingHorarios } =
    useHorariosByCancha(canchaId)
  const { data: tarifas } = useTarifasByCancha(canchaId)

  const eliminar = useEliminarHorario()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<HorarioCancha | undefined>()
  const [defaultDia, setDefaultDia] = useState<DiaSemana | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<HorarioCancha | null>(null)

  // Indexamos por día para mostrar las 7 filas siempre
  const porDia = useMemo(() => {
    const map = new Map<DiaSemana, HorarioCancha>()
    for (const h of horarios ?? []) map.set(h.diaSemana, h)
    return map
  }, [horarios])

  const diasOcupados = useMemo(
    () => Array.from(porDia.keys()),
    [porDia],
  )

  const onCrear = (dia?: DiaSemana) => {
    setEditing(undefined)
    setDefaultDia(dia)
    setFormOpen(true)
  }
  const onEditar = (h: HorarioCancha) => {
    setEditing(h)
    setDefaultDia(undefined)
    setFormOpen(true)
  }
  const onEliminarAsk = (h: HorarioCancha) => {
    setTarget(h)
    setConfirmOpen(true)
  }
  const onConfirmEliminar = async () => {
    if (!target) return
    await eliminar.mutateAsync(target.id)
    setConfirmOpen(false)
    setTarget(null)
  }

  return (
    <>
      <Header
        title="Horarios"
        breadcrumb={[{ label: 'Operación' }, { label: 'Horarios' }]}
        onNew={canchaId ? () => onCrear() : undefined}
        newLabel="+ Nuevo horario"
        onOpenMenu={openMenu}
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-0">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-dark">
                  Horario operativo {cancha ? `· ${cancha.nombre}` : ''}
                </h3>
                <p className="text-xs text-gray-500">
                  Define las horas de apertura y cierre por día.
                </p>
              </div>
              <div className="w-full sm:w-72">
                <SearchableSelect
                  options={(canchas ?? []).map((c) => ({
                    label: c.nombre,
                    value: c.id,
                  }))}
                  value={canchaId}
                  onChange={(v) => setCanchaId(v)}
                  placeholder="Selecciona una cancha"
                  emptyText="Sin canchas registradas"
                  loading={loadingCanchas}
                />
              </div>
            </div>
          </div>

          {loadingLocal || loadingCanchas ? (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : !localId ? (
            <EmptyMessage
              titulo="Aún no tienes un local registrado"
              detalle="Crea un local desde Configuración para gestionar horarios."
            />
          ) : !canchas || canchas.length === 0 ? (
            <EmptyMessage
              titulo="No tienes canchas en este local"
              detalle="Registra al menos una cancha para definirle horarios."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Día</th>
                  <th className="px-5 py-3">Apertura</th>
                  <th className="px-5 py-3">Cierre</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingHorarios ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      <Spinner size="md" />
                    </td>
                  </tr>
                ) : (
                  DIAS_SEMANA.map((dia) => {
                    const h = porDia.get(dia)
                    return (
                      <tr
                        key={dia}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-5 py-3 font-semibold text-dark">
                          {DIAS_LABEL[dia]}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {h?.horaApertura ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {h?.horaCierre ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          {h ? (
                            <Badge variant="success">Abierto</Badge>
                          ) : (
                            <Badge variant="neutral">Cerrado</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {h ? (
                              <>
                                <button
                                  onClick={() => onEditar(h)}
                                  className="rounded-lg p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary"
                                  aria-label="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => onEliminarAsk(h)}
                                  className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                  aria-label="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => onCrear(dia)}
                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-50"
                              >
                                <Plus size={12} /> Agregar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-dark">
            Tarifas por hora
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {cancha
              ? 'Tarifas que aplican a esta cancha (incluye las heredadas del tipo).'
              : 'Selecciona una cancha para ver sus tarifas.'}
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            {(tarifas ?? []).length === 0 ? (
              <li className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-500">
                Aún no hay tarifas configuradas.
              </li>
            ) : (
              (tarifas ?? []).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
                >
                  <span className="min-w-0">
                    <Badge
                      variant={
                        t.tipo === 'NORMAL'
                          ? 'neutral'
                          : t.tipo === 'NOCTURNA'
                            ? 'warning'
                            : 'primary'
                      }
                      size="sm"
                    >
                      {tarifaLabel(t.tipo)}
                    </Badge>
                    <span className="ml-2 text-xs text-gray-600">
                      {t.horaInicio} – {t.horaFin}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-dark">
                    S/ {Number(t.precioHora).toFixed(2)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar horario' : 'Nuevo horario'}
        description={
          cancha
            ? `Cancha: ${cancha.nombre}`
            : 'Configura las horas de operación.'
        }
        size="md"
      >
        <HorarioForm
          canchaId={canchaId}
          horario={editing}
          diasOcupados={diasOcupados}
          defaultDia={defaultDia}
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar horario"
        description={
          target
            ? `¿Eliminar el horario de ${DIAS_LABEL[target.diaSemana]}?`
            : ''
        }
        variant="danger"
        confirmLabel="Eliminar"
        loading={eliminar.isPending}
        onConfirm={onConfirmEliminar}
        onCancel={() => {
          setConfirmOpen(false)
          setTarget(null)
        }}
      />
    </>
  )
}

function tarifaLabel(t: string) {
  switch (t) {
    case 'NORMAL':
      return 'Normal'
    case 'NOCTURNA':
      return 'Nocturna'
    case 'FIN_DE_SEMANA':
      return 'Fin de semana'
    default:
      return t
  }
}

function EmptyMessage({
  titulo,
  detalle,
}: {
  titulo: string
  detalle: string
}) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-semibold text-dark">{titulo}</p>
      <p className="mt-1 text-xs text-gray-500">{detalle}</p>
    </div>
  )
}
