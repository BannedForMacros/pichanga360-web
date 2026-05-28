'use client'

import { useState } from 'react'
import {
  CalendarClock,
  CalendarPlus,
  Pause,
  Play,
  Repeat,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Spinner } from '@/components/ui/Spinner'
import { ReservaFijaForm } from './ReservaFijaForm'
import {
  useActualizarRecurrente,
  useEliminarRecurrente,
  useGenerarRecurrente,
  useReservasRecurrentesByLocal,
} from '@/hooks/reservas/useReservasRecurrentes'
import { formatDate } from '@/lib/utils'
import type { DiaSemana, ReservaRecurrente } from '@/types'

const DIA_LABEL: Record<DiaSemana, string> = {
  LUNES: 'lunes',
  MARTES: 'martes',
  MIERCOLES: 'miércoles',
  JUEVES: 'jueves',
  VIERNES: 'viernes',
  SABADO: 'sábados',
  DOMINGO: 'domingos',
}

/** YYYY-MM-DD de hoy + n días (hora local) → ISO al mediodía. */
function horizonteISO(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

interface Props {
  localId?: string
  canchas: { id: string; nombre: string }[]
  defaultCanchaId?: string
}

export function ReservasFijasPanel({ localId, canchas, defaultCanchaId }: Props) {
  const { data: fijas, isLoading } = useReservasRecurrentesByLocal(localId)
  const generar = useGenerarRecurrente()
  const actualizar = useActualizarRecurrente()
  const eliminar = useEliminarRecurrente()

  const [crearOpen, setCrearOpen] = useState(false)
  const [aEliminar, setAEliminar] = useState<ReservaRecurrente | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  const lista = fijas ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Bloquea automáticamente el mismo horario cada semana para tus clientes
          habituales.
        </p>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<CalendarPlus size={14} />}
          onClick={() => setCrearOpen(true)}
          disabled={canchas.length === 0}
        >
          Nueva reserva fija
        </Button>
      </div>

      {lista.length === 0 ? (
        <EmptyState
          onCrear={() => setCrearOpen(true)}
          puedeCrear={canchas.length > 0}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((r) => {
            const nombre = r.cliente
              ? `${r.cliente.nombre} ${r.cliente.apellido ?? ''}`.trim()
              : 'Cliente'
            return (
              <li
                key={r.id}
                className="rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-dark">
                      {nombre}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {r.cancha?.nombre ?? 'Cancha'}
                    </p>
                  </div>
                  <Badge variant={r.activa ? 'success' : 'neutral'} size="sm">
                    {r.activa ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700">
                  <Repeat size={14} className="shrink-0" />
                  Cada {DIA_LABEL[r.diaSemana]} · {r.horaInicio}–{r.horaFin}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Desde {formatDate(r.fechaInicio)}
                  {r.fechaFin
                    ? ` · hasta ${formatDate(r.fechaFin)}`
                    : ' · sin fecha de fin'}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<CalendarPlus size={14} />}
                    loading={generar.isPending && generar.variables?.id === r.id}
                    onClick={() =>
                      generar.mutate({ id: r.id, hasta: horizonteISO(56) })
                    }
                    title="Generar las reservas de las próximas 8 semanas"
                  >
                    Generar próximas
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={
                      r.activa ? <Pause size={14} /> : <Play size={14} />
                    }
                    loading={
                      actualizar.isPending && actualizar.variables?.id === r.id
                    }
                    onClick={() =>
                      actualizar.mutate({
                        id: r.id,
                        data: { activa: !r.activa },
                      })
                    }
                  >
                    {r.activa ? 'Pausar' : 'Reactivar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => setAEliminar(r)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        isOpen={crearOpen}
        onClose={() => setCrearOpen(false)}
        title="Nueva reserva fija"
        description="Asegura el horario de un cliente habitual semana a semana."
        size="lg"
      >
        <ReservaFijaForm
          canchas={canchas}
          defaultCanchaId={defaultCanchaId}
          onSuccess={() => setCrearOpen(false)}
          onCancel={() => setCrearOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!aEliminar}
        title="Eliminar reserva fija"
        description={
          aEliminar
            ? `¿Eliminar la reserva fija de ${aEliminar.cliente?.nombre ?? 'este cliente'} de los ${DIA_LABEL[aEliminar.diaSemana]}? Las reservas ya generadas no se borran; solo se deja de repetir.`
            : ''
        }
        variant="danger"
        confirmLabel="Sí, eliminar"
        loading={eliminar.isPending}
        onConfirm={async () => {
          if (!aEliminar) return
          await eliminar.mutateAsync(aEliminar.id)
          setAEliminar(null)
        }}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  )
}

function EmptyState({
  onCrear,
  puedeCrear,
}: {
  onCrear: () => void
  puedeCrear: boolean
}) {
  return (
    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary-50/40 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
        <CalendarClock size={22} />
      </div>
      <h3 className="mt-4 flex items-center justify-center gap-1.5 text-base font-bold text-dark">
        <Sparkles size={16} className="text-warning" />
        Convierte clientes en ingresos seguros
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
        El equipo de los martes, la pichanga de los viernes… deja que el horario
        se reserve solo cada semana. Tú solo cobras y el cliente nunca pierde su
        cancha.
      </p>
      <Button
        className="mt-5"
        leftIcon={<CalendarPlus size={16} />}
        onClick={onCrear}
        disabled={!puedeCrear}
      >
        Crear mi primera reserva fija
      </Button>
      {!puedeCrear && (
        <p className="mt-2 text-xs text-gray-500">
          Primero registra una cancha en este local.
        </p>
      )}
    </div>
  )
}
