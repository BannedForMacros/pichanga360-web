'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { TarifaForm } from '@/components/tarifas/TarifaForm'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import {
  useEliminarTarifa,
  useTarifasByCancha,
} from '@/hooks/tarifas/useTarifas'
import { TIPO_TARIFA_LABEL } from '@/validators/tarifas/tarifa.schema'
import { formatCurrency } from '@/lib/utils'
import type { Tarifa, TipoTarifa } from '@/types'

const TIPO_VARIANT: Record<TipoTarifa, 'neutral' | 'warning' | 'primary'> = {
  NORMAL: 'neutral',
  NOCTURNA: 'warning',
  FIN_DE_SEMANA: 'primary',
}

export default function TarifasPage() {
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()

  const { data: canchas, isLoading: loadingCanchas } =
    useCanchasByLocal(localId ?? undefined)
  const [canchaId, setCanchaId] = useState<string | undefined>()

  // Auto-seleccionar la primera cancha cuando cambia el local
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
  const { data: tarifas, isLoading: loadingTarifas } =
    useTarifasByCancha(canchaId)

  const eliminar = useEliminarTarifa()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Tarifa | undefined>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [target, setTarget] = useState<Tarifa | null>(null)

  // Distinguimos tarifas override (canchaId === canchaActual) de las heredadas
  // del tipoCancha (tipoCanchaId set, canchaId null).
  const { overrides, heredadas } = useMemo(() => {
    const list = tarifas ?? []
    return {
      overrides: list.filter((t) => t.canchaId === canchaId),
      heredadas: list.filter((t) => !t.canchaId && t.tipoCanchaId),
    }
  }, [tarifas, canchaId])

  const onCrear = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const onEditar = (t: Tarifa) => {
    setEditing(t)
    setFormOpen(true)
  }
  const onEliminarAsk = (t: Tarifa) => {
    setTarget(t)
    setConfirmOpen(true)
  }

  return (
    <>
      <Header
        title="Tarifas"
        breadcrumb={[{ label: 'Operación' }, { label: 'Tarifas' }]}
        onNew={canchaId ? onCrear : undefined}
        newLabel="+ Nueva tarifa"
        onOpenMenu={openMenu}
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-0">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-dark">
                  Tarifas {cancha ? `· ${cancha.nombre}` : ''}
                </h3>
                <p className="text-xs text-gray-500">
                  Define el precio por hora según franja horaria.
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
            <Empty
              titulo="Aún no tienes un local registrado"
              detalle="Crea un local desde Configuración para definir tarifas."
            />
          ) : !canchas || canchas.length === 0 ? (
            <Empty
              titulo="No tienes canchas en este local"
              detalle="Registra al menos una cancha para asignarle tarifas."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Franja horaria</th>
                  <th className="px-5 py-3">Precio / hora</th>
                  <th className="px-5 py-3">Origen</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loadingTarifas ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center">
                      <Spinner size="md" />
                    </td>
                  </tr>
                ) : (tarifas ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-gray-500"
                    >
                      No hay tarifas configuradas. Click en "+ Nueva tarifa".
                    </td>
                  </tr>
                ) : (
                  <>
                    {overrides.map((t) => (
                      <FilaTarifa
                        key={t.id}
                        tarifa={t}
                        origen="override"
                        onEdit={onEditar}
                        onDelete={onEliminarAsk}
                      />
                    ))}
                    {heredadas.map((t) => (
                      <FilaTarifa
                        key={t.id}
                        tarifa={t}
                        origen="heredada"
                      />
                    ))}
                  </>
                )}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h3 className="text-base font-semibold text-dark">Cómo funcionan</h3>
          <ul className="mt-3 space-y-3 text-sm text-gray-700">
            <li>
              <strong className="text-dark">Override por cancha:</strong> aplica
              solo a esta cancha y reemplaza la heredada en su misma franja.
            </li>
            <li>
              <strong className="text-dark">Heredada del tipo:</strong> la
              configuras en "Tipos de cancha" y aplica a todas las canchas del
              mismo tipo.
            </li>
            <li>
              Si dos tarifas se solapan, la del tipo NOCTURNA gana de noche y la
              de FIN_DE_SEMANA en sábado/domingo.
            </li>
          </ul>
        </Card>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Editar tarifa' : 'Nueva tarifa'}
        description={cancha ? `Cancha: ${cancha.nombre}` : ''}
        size="md"
      >
        <TarifaForm
          canchaId={canchaId}
          tarifa={editing}
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar tarifa"
        description={
          target
            ? `¿Eliminar tarifa ${TIPO_TARIFA_LABEL[target.tipo]} (${target.horaInicio}–${target.horaFin})?`
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

  function FilaTarifa({
    tarifa,
    origen,
    onEdit,
    onDelete,
  }: {
    tarifa: Tarifa
    origen: 'override' | 'heredada'
    onEdit?: (t: Tarifa) => void
    onDelete?: (t: Tarifa) => void
  }) {
    return (
      <tr className="border-t border-gray-100 hover:bg-gray-50">
        <td className="px-5 py-3">
          <Badge variant={TIPO_VARIANT[tarifa.tipo]}>
            {TIPO_TARIFA_LABEL[tarifa.tipo]}
          </Badge>
        </td>
        <td className="px-5 py-3 text-gray-700">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-gray-400" />
            {tarifa.horaInicio} – {tarifa.horaFin}
          </span>
        </td>
        <td className="px-5 py-3 font-bold text-dark">
          {formatCurrency(Number(tarifa.precioHora))}
        </td>
        <td className="px-5 py-3">
          {origen === 'override' ? (
            <Badge variant="info" size="sm">
              Esta cancha
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Heredada del tipo
            </Badge>
          )}
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            {origen === 'override' && onEdit && (
              <button
                onClick={() => onEdit(tarifa)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-primary-50 hover:text-primary"
                aria-label="Editar"
              >
                <Pencil size={14} />
              </button>
            )}
            {origen === 'override' && onDelete && (
              <button
                onClick={() => onDelete(tarifa)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            )}
            {origen === 'heredada' && (
              <span className="text-xs text-gray-400">
                Editar desde Tipos de cancha
              </span>
            )}
          </div>
        </td>
      </tr>
    )
  }
}

function Empty({ titulo, detalle }: { titulo: string; detalle: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm font-semibold text-dark">{titulo}</p>
      <p className="mt-1 text-xs text-gray-500">{detalle}</p>
    </div>
  )
}
