'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useHorariosByCancha } from '@/hooks/horarios/useHorarios'
import { useReservas } from '@/hooks/reservas/useReservas'
import { cn } from '@/lib/utils'
import type { DiaSemana, EstadoReserva, Reserva } from '@/types'

const DIAS_LABEL: { key: DiaSemana; corto: string; largo: string }[] = [
  { key: 'LUNES', corto: 'Lun', largo: 'Lunes' },
  { key: 'MARTES', corto: 'Mar', largo: 'Martes' },
  { key: 'MIERCOLES', corto: 'Mié', largo: 'Miércoles' },
  { key: 'JUEVES', corto: 'Jue', largo: 'Jueves' },
  { key: 'VIERNES', corto: 'Vie', largo: 'Viernes' },
  { key: 'SABADO', corto: 'Sáb', largo: 'Sábado' },
  { key: 'DOMINGO', corto: 'Dom', largo: 'Domingo' },
]

const ESTADO_BG: Record<EstadoReserva, string> = {
  PENDIENTE: 'bg-warning/15 border-warning/40 text-warning-700 hover:bg-warning/25',
  CONFIRMADA: 'bg-success/15 border-success/40 text-success-700 hover:bg-success/25',
  EN_CURSO: 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30',
  COMPLETADA: 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200',
  CANCELADA: 'bg-red-50 border-red-200 text-red-600 line-through opacity-60',
}

/** Lunes (00:00) de la semana que contiene `d`. */
function lunesDeSemana(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const dow = x.getDay() // 0=Dom, 1=Lun
  const diff = dow === 0 ? -6 : 1 - dow
  x.setDate(x.getDate() + diff)
  return x
}

function addDias(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function fmtRangoSemana(lunes: Date): string {
  const dom = addDias(lunes, 6)
  const fmt = new Intl.DateTimeFormat('es-PE', {
    day: 'numeric',
    month: 'short',
  })
  return `${fmt.format(lunes)} – ${fmt.format(dom)}`
}

function isMismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

interface Props {
  canchaId: string | undefined
  /** Click en un slot libre → crear reserva pre-rellenando fecha y hora */
  onCrearReserva?: (fecha: string, horaInicio: string) => void
  /** Click en una reserva existente → abrir su detalle */
  onClickReserva?: (r: Reserva) => void
}

export function CalendarioSemanal({
  canchaId,
  onCrearReserva,
  onClickReserva,
}: Props) {
  const [refDate, setRefDate] = useState(() => new Date())
  const lunes = useMemo(() => lunesDeSemana(refDate), [refDate])
  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDias(lunes, i)),
    [lunes],
  )

  const desde = lunes.toISOString()
  const hasta = addDias(lunes, 7).toISOString()

  const { data: horarios } = useHorariosByCancha(canchaId)
  const { data: reservasResp, isLoading } = useReservas({
    canchaId,
    desde,
    hasta,
    limit: 200,
  })

  // Rango de horas según horarios operativos. Sin horarios → default 7-23.
  const { horaMin, horaMax } = useMemo(() => {
    const all = horarios ?? []
    if (all.length === 0) return { horaMin: 7, horaMax: 23 }
    const mins = all.map((h) => parseInt(h.horaApertura.slice(0, 2), 10))
    const maxs = all.map((h) => parseInt(h.horaCierre.slice(0, 2), 10))
    return {
      horaMin: Math.min(...mins),
      horaMax: Math.max(...maxs),
    }
  }, [horarios])

  const horarioPorDia = useMemo(() => {
    const m = new Map<DiaSemana, { apertura: string; cierre: string }>()
    for (const h of horarios ?? []) {
      m.set(h.diaSemana, { apertura: h.horaApertura, cierre: h.horaCierre })
    }
    return m
  }, [horarios])

  const reservasPorDia = useMemo(() => {
    const m = new Map<string, Reserva[]>()
    for (const r of reservasResp?.data ?? []) {
      const key = new Date(r.fechaInicio).toISOString().slice(0, 10)
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(r)
    }
    return m
  }, [reservasResp])

  const horas = Array.from({ length: horaMax - horaMin }, (_, i) => horaMin + i)
  const hoy = new Date()

  const goSemana = (delta: number) => setRefDate((d) => addDias(d, delta * 7))
  const goHoy = () => setRefDate(new Date())

  if (!canchaId) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-base font-semibold text-dark">
          Selecciona una cancha
        </p>
        <p className="mt-1 text-xs text-gray-500">
          El calendario muestra reservas y horarios libres de una cancha a la vez.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goSemana(-1)}
            leftIcon={<ChevronLeft size={14} />}
          >
            Anterior
          </Button>
          <Button variant="ghost" size="sm" onClick={goHoy}>
            Hoy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goSemana(1)}
            rightIcon={<ChevronRight size={14} />}
          >
            Siguiente
          </Button>
        </div>
        <p className="text-sm font-semibold text-dark">
          Semana del {fmtRangoSemana(lunes)}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-10 w-16 border-b border-gray-100 bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-500">
                  Hora
                </th>
                {dias.map((d, i) => {
                  const esHoy = isMismoDia(d, hoy)
                  return (
                    <th
                      key={i}
                      className={cn(
                        'border-b border-gray-100 px-2 py-2 text-center text-xs font-semibold',
                        esHoy
                          ? 'bg-primary text-white'
                          : 'bg-gray-50 text-gray-600',
                      )}
                    >
                      <div className="text-[10px] uppercase opacity-80">
                        {DIAS_LABEL[i].corto}
                      </div>
                      <div className="mt-0.5 text-base font-bold">
                        {d.getDate()}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {horas.map((h) => {
                const hh = String(h).padStart(2, '0') + ':00'
                const hhFin = String(h + 1).padStart(2, '0') + ':00'
                return (
                  <tr key={h}>
                    <td className="sticky left-0 z-10 border-b border-gray-100 bg-white px-2 py-2 text-center text-[11px] font-semibold text-gray-500">
                      {hh}
                    </td>
                    {dias.map((dia, idxDia) => {
                      const diaKey = DIAS_LABEL[idxDia].key
                      const op = horarioPorDia.get(diaKey)
                      const operativo =
                        !!op && hh >= op.apertura && hhFin <= op.cierre

                      const fechaISO = dia.toISOString().slice(0, 10)
                      const reservas = reservasPorDia.get(fechaISO) ?? []
                      const reservaSlot = reservas.find((r) => {
                        const ini = new Date(r.fechaInicio)
                        const fin = new Date(r.fechaFin)
                        const slotIni = new Date(dia)
                        slotIni.setHours(h, 0, 0, 0)
                        const slotFin = new Date(slotIni)
                        slotFin.setHours(h + 1, 0, 0, 0)
                        return ini < slotFin && fin > slotIni
                      })

                      return (
                        <td
                          key={idxDia}
                          className="h-14 border-b border-l border-gray-100 align-top"
                        >
                          {reservaSlot ? (
                            <button
                              onClick={() => onClickReserva?.(reservaSlot)}
                              className={cn(
                                'h-full w-full border-l-2 px-2 py-1 text-left text-[11px] font-semibold transition',
                                ESTADO_BG[reservaSlot.estado],
                              )}
                              title={
                                reservaSlot.cliente
                                  ? `${reservaSlot.cliente.nombre} ${reservaSlot.cliente.apellido}`
                                  : 'Reserva'
                              }
                            >
                              <p className="truncate">
                                {reservaSlot.cliente
                                  ? `${reservaSlot.cliente.nombre} ${reservaSlot.cliente.apellido}`
                                  : 'Reserva'}
                              </p>
                              <p className="truncate text-[9px] font-normal opacity-80">
                                {reservaSlot.estado}
                              </p>
                            </button>
                          ) : operativo ? (
                            <button
                              onClick={() => onCrearReserva?.(fechaISO, hh)}
                              className="group flex h-full w-full items-center justify-center text-gray-400 hover:bg-primary-50"
                              aria-label={`Crear reserva ${fechaISO} ${hh}`}
                            >
                              <Plus
                                size={14}
                                className="opacity-0 group-hover:opacity-100"
                              />
                            </button>
                          ) : (
                            <div
                              className="h-full w-full bg-gray-50/70"
                              aria-label="Fuera de horario operativo"
                            />
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-gray-100 bg-gray-50 px-4 py-3 text-[11px] text-gray-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-warning/40 bg-warning/15" />{' '}
          Pendiente
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-success/40 bg-success/15" />{' '}
          Confirmada
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded border border-primary/40 bg-primary/20" />{' '}
          En curso
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-gray-50/70 ring-1 ring-gray-200" />{' '}
          Fuera de horario
        </span>
      </div>
    </div>
  )
}
