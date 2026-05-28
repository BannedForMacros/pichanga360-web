'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type {
  DiaSemana,
  GenerarRecurrenteResult,
  ReservaRecurrente,
} from '@/types'

const KEY = ['reservas-recurrentes']

/**
 * Backend: GET /reservas-recurrentes/local/:localId
 * Reservas fijas de un local (de cualquier cliente), para el panel del dueño.
 */
export function useReservasRecurrentesByLocal(localId?: string) {
  return useQuery({
    queryKey: [...KEY, 'local', localId],
    enabled: !!localId,
    queryFn: async () => {
      const { data } = await api.get<ReservaRecurrente[]>(
        `/reservas-recurrentes/local/${localId}`,
      )
      return data
    },
  })
}

export interface CrearRecurrenteInput {
  canchaId: string
  clienteId?: string
  diaSemana: DiaSemana
  horaInicio: string // HH:mm
  horaFin: string // HH:mm
  fechaInicio: string // ISO
  fechaFin?: string // ISO
}

/** Backend: POST /reservas-recurrentes */
export function useCrearRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CrearRecurrenteInput) => {
      const { data: rec } = await api.post<ReservaRecurrente>(
        '/reservas-recurrentes',
        data,
      )
      return rec
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
    },
  })
}

/**
 * Backend: POST /reservas-recurrentes/:id/generar
 * Crea las reservas semanales hasta `hasta` (omitiendo las que choquen).
 */
export function useGenerarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, hasta }: { id: string; hasta: string }) => {
      const { data } = await api.post<GenerarRecurrenteResult>(
        `/reservas-recurrentes/${id}/generar`,
        { hasta },
      )
      return data
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['reservas'] })
      qc.invalidateQueries({ queryKey: KEY })
      const omitidas = res.errores.length
      toast.success(
        omitidas > 0
          ? `${res.creadas} reservas creadas · ${omitidas} se omitieron por choque de horario`
          : `${res.creadas} reservas creadas`,
        { position: 'top-right' },
      )
    },
  })
}

/** Backend: PATCH /reservas-recurrentes/:id (activar/desactivar o cambiar vigencia) */
export function useActualizarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: { activa?: boolean; fechaFin?: string }
    }) => {
      const { data: rec } = await api.patch<ReservaRecurrente>(
        `/reservas-recurrentes/${id}`,
        data,
      )
      return rec
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: KEY })
      if (vars.data.activa !== undefined) {
        toast.success(
          vars.data.activa ? 'Reserva fija reactivada' : 'Reserva fija pausada',
          { position: 'top-right' },
        )
      }
    },
  })
}

/** Backend: DELETE /reservas-recurrentes/:id */
export function useEliminarRecurrente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reservas-recurrentes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Reserva fija eliminada', { position: 'top-right' })
    },
  })
}
