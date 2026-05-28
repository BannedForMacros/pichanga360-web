'use client'

import { useMemo, useState } from 'react'
import { CalendarClock, CalendarRange, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { TimePicker } from '@/components/ui/TimePicker'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { ClienteSelectorReserva } from './ClienteSelectorReserva'
import {
  useCrearRecurrente,
  useGenerarRecurrente,
} from '@/hooks/reservas/useReservasRecurrentes'
import {
  DURACIONES_MIN,
  DURACION_LABEL,
  horaFinFromDuracion,
} from '@/validators/reservas/reserva.schema'
import type { Cancha, DiaSemana, Usuario } from '@/types'

const DIAS: { value: DiaSemana; label: string }[] = [
  { value: 'LUNES', label: 'Lunes' },
  { value: 'MARTES', label: 'Martes' },
  { value: 'MIERCOLES', label: 'Miércoles' },
  { value: 'JUEVES', label: 'Jueves' },
  { value: 'VIERNES', label: 'Viernes' },
  { value: 'SABADO', label: 'Sábado' },
  { value: 'DOMINGO', label: 'Domingo' },
]

/** ISO al mediodía local de una fecha YYYY-MM-DD (evita corrimientos de día). */
function fechaAlMediodiaISO(ymd: string): string {
  return new Date(`${ymd}T12:00:00`).toISOString()
}

/** YYYY-MM-DD de hoy + n días, en hora local. */
function ymdHoyMas(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
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

export function ReservaFijaForm({
  canchas,
  defaultCanchaId,
  onSuccess,
  onCancel,
}: Props) {
  const crear = useCrearRecurrente()
  const generar = useGenerarRecurrente()

  const [cliente, setCliente] = useState<Usuario | null>(null)
  const [clienteError, setClienteError] = useState<string>()
  const [canchaId, setCanchaId] = useState(defaultCanchaId ?? '')
  const [diaSemana, setDiaSemana] = useState<DiaSemana | ''>('')
  const [horaInicio, setHoraInicio] = useState('18:00')
  const [duracionMin, setDuracionMin] = useState(60)
  const [desde, setDesde] = useState(ymdHoyMas(0))
  const [hasta, setHasta] = useState('')
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

  const enviando = crear.isPending || generar.isPending
  const submitting = enviando

  const onSubmit = async () => {
    setError(undefined)
    if (!cliente) {
      setClienteError('Elige el cliente de la reserva fija')
      return
    }
    setClienteError(undefined)
    if (!canchaId) return setError('Selecciona una cancha')
    if (!diaSemana) return setError('Elige el día de la semana')
    if (!horaFin) return setError('La duración hace que termine después de medianoche')
    if (hasta && hasta < desde) {
      return setError('La fecha "hasta" no puede ser anterior a "desde"')
    }

    const rec = await crear.mutateAsync({
      canchaId,
      clienteId: cliente.id,
      diaSemana,
      horaInicio,
      horaFin,
      fechaInicio: fechaAlMediodiaISO(desde),
      fechaFin: hasta ? fechaAlMediodiaISO(hasta) : undefined,
    })

    // Generamos las reservas de una vez para que el dueño las vea en su
    // calendario. Horizonte: hasta la fecha fin si la puso, o 8 semanas.
    const hastaGen = hasta ? hasta : ymdHoyMas(56)
    try {
      await generar.mutateAsync({ id: rec.id, hasta: fechaAlMediodiaISO(hastaGen) })
    } catch {
      /* el interceptor ya avisa; la recurrente quedó creada igual */
    }
    onSuccess?.()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
        Una <span className="font-semibold">reserva fija</span> bloquea el mismo
        horario cada semana para un cliente habitual. Creamos las reservas
        automáticamente y tú solo cobras. Ideal para el equipo de los martes o
        la pichanga de los viernes. 💪
      </div>

      <Section icono={<UserIcon size={14} />} titulo="¿Para qué cliente?">
        <ClienteSelectorReserva
          value={cliente}
          onChange={(c) => {
            setCliente(c)
            if (c) setClienteError(undefined)
          }}
          error={clienteError}
        />
      </Section>

      <Section icono={<CalendarClock size={14} />} titulo="¿Qué día y a qué hora?">
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
            <SearchableSelect
              label="Día de la semana"
              options={DIAS.map((d) => ({ label: d.label, value: d.value }))}
              value={diaSemana || undefined}
              onChange={(v) => setDiaSemana(v as DiaSemana)}
              placeholder="¿Qué día?"
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
              Cada {DIAS.find((d) => d.value === diaSemana)?.label.toLowerCase() ?? 'semana'}{' '}
              de <span className="font-semibold text-dark">{horaInicio}</span> a{' '}
              <span className="font-semibold text-dark">{horaFin}</span>.
            </p>
          )}
        </div>
      </Section>

      <Section icono={<CalendarRange size={14} />} titulo="¿Desde y hasta cuándo?">
        <div className="grid gap-4 md:grid-cols-2">
          <DatePicker
            label="Empieza el"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
          <DatePicker
            label="Repetir hasta (opcional)"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Si lo dejas en blanco, generamos las próximas 8 semanas y podrás
          extenderlo cuando quieras desde la lista.
        </p>
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
        <Button type="button" onClick={onSubmit} loading={submitting}>
          Crear reserva fija
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
