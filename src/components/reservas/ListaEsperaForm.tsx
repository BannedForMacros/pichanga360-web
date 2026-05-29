'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { ClienteSelectorReserva } from './ClienteSelectorReserva'
import { useAgregarListaEspera } from '@/hooks/reservas/useListaEspera'
import {
  DURACIONES_MIN,
  DURACION_LABEL,
  combineDateTime,
  horaFinFromDuracion,
} from '@/validators/reservas/reserva.schema'
import type { Cancha, Usuario } from '@/types'

/** YYYY-MM-DD de hoy, en hora local. */
function ymdHoy(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface Props {
  canchas: Pick<Cancha, 'id' | 'nombre'>[]
  defaultCanchaId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ListaEsperaForm({
  canchas,
  defaultCanchaId,
  onSuccess,
  onCancel,
}: Props) {
  const agregar = useAgregarListaEspera()

  const [cliente, setCliente] = useState<Usuario | null>(null)
  const [clienteError, setClienteError] = useState<string>()
  const [canchaId, setCanchaId] = useState(defaultCanchaId ?? '')
  const [fecha, setFecha] = useState(ymdHoy())
  const [horaInicio, setHoraInicio] = useState('18:00')
  const [duracionMin, setDuracionMin] = useState(60)
  const [error, setError] = useState<string>()

  const horaFin = useMemo(
    () => horaFinFromDuracion(horaInicio, duracionMin),
    [horaInicio, duracionMin],
  )

  const opcionesDuracion = useMemo(() => {
    const validHora = /^\d{2}:\d{2}$/.test(horaInicio)
    return DURACIONES_MIN.filter((min) =>
      validHora ? horaFinFromDuracion(horaInicio, min) !== null : true,
    ).map((min) => {
      const fin = validHora ? horaFinFromDuracion(horaInicio, min) : null
      return {
        value: String(min),
        label: DURACION_LABEL[min],
        description: fin ? `Termina a las ${fin}` : undefined,
      }
    })
  }, [horaInicio])

  const onSubmit = async () => {
    setError(undefined)
    if (!cliente) {
      setClienteError('Elige el cliente que espera el horario')
      return
    }
    setClienteError(undefined)
    if (!canchaId) return setError('Selecciona una cancha')
    if (!horaFin) {
      return setError('La duración hace que termine después de medianoche')
    }

    await agregar.mutateAsync({
      canchaId,
      clienteId: cliente.id,
      fechaInicio: combineDateTime(fecha, horaInicio),
      fechaFin: combineDateTime(fecha, horaFin),
    })
    onSuccess?.()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
        Anota a un cliente que quería un horario <span className="font-semibold">ocupado</span>.
        Si esa reserva se cancela, podrás contactarlo para ofrecerle el espacio.
      </div>

      <Section icono={<UserIcon size={14} />} titulo="¿Qué cliente espera?">
        <ClienteSelectorReserva
          value={cliente}
          onChange={(c) => {
            setCliente(c)
            if (c) setClienteError(undefined)
          }}
          error={clienteError}
        />
      </Section>

      <Section icono={<CalendarClock size={14} />} titulo="¿Qué horario quiere?">
        <div className="space-y-4">
          <SearchableSelect
            label="Cancha"
            options={canchas.map((c) => ({ label: c.nombre, value: c.id }))}
            value={canchaId}
            onChange={setCanchaId}
            placeholder="Selecciona una cancha"
            emptyText="No hay canchas disponibles"
          />
          <div className="grid gap-4 md:grid-cols-3">
            <DatePicker
              label="Fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <TimePicker
              label="Hora de inicio"
              step={1800}
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
            <SearchableSelect
              label="Duración"
              options={opcionesDuracion}
              value={String(duracionMin)}
              onChange={(v) => setDuracionMin(parseInt(v, 10))}
              placeholder="¿Cuánto dura?"
            />
          </div>
          {horaFin && (
            <p className="text-xs text-gray-600">
              Horario:{' '}
              <span className="font-semibold text-dark">{horaInicio}</span> a{' '}
              <span className="font-semibold text-dark">{horaFin}</span>.
            </p>
          )}
        </div>
      </Section>

      {error && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="button" onClick={onSubmit} loading={agregar.isPending}>
          Agregar a la lista
        </Button>
      </div>
    </div>
  )
}

function Section({
  icono,
  titulo,
  children,
}: {
  icono: React.ReactNode
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-dark">
        {icono}
        {titulo}
      </h3>
      {children}
    </section>
  )
}
