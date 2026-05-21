'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { EstadoReserva, Reserva } from '@/types'

export interface CreateReservaInput {
  canchaId: string
  fechaInicio: string // ISO
  fechaFin: string // ISO
  notas?: string
  /**
   * Solo lo usa admin/operador para reservar a nombre de un cliente walk-in.
   * Si no se envía, el backend usa el usuario logueado.
   */
  clienteId?: string
  /**
   * Solo admin/operador. 'CONFIRMADA' crea la reserva ya confirmada
   * (cliente conocido o paga al momento). Si no se envía, nace en PENDIENTE.
   */
  estadoInicial?: 'PENDIENTE' | 'CONFIRMADA'
}

/**
 * Backend: POST /reservas
 */
export function useCrearReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateReservaInput) => {
      const { data: reserva } = await api.post<Reserva>('/reservas', data)
      return reserva
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva creada correctamente', { position: 'top-right' })
    },
  })
}

export interface UpdateReservaInput {
  canchaId?: string
  /** ISO completo */
  fechaInicio?: string
  /** ISO completo */
  fechaFin?: string
  notas?: string
  /** Queda registrado en la auditoría de la reserva */
  motivo?: string
}

/**
 * Backend: PATCH /reservas/:id
 *
 * Solo edita datos logísticos (cancha, fecha, hora, notas). No cambia estado
 * ni cliente. Solo admin/operador del local, y solo si la reserva está en
 * PENDIENTE o CONFIRMADA.
 */
export function useActualizarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateReservaInput
    }) => {
      const { data: reserva } = await api.patch<Reserva>(`/reservas/${id}`, data)
      return reserva
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva actualizada', { position: 'top-right' })
    },
  })
}

/**
 * Backend: PATCH /reservas/:id/estado
 * Body: { estado, motivo? }
 */
export function useCambiarEstadoReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      estado,
      motivo,
    }: {
      id: string
      estado: EstadoReserva
      motivo?: string
    }) => {
      const { data } = await api.patch<Reserva>(`/reservas/${id}/estado`, {
        estado,
        motivo,
      })
      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      const labels: Record<EstadoReserva, string> = {
        PENDIENTE: 'Reserva marcada como pendiente',
        CONFIRMADA: 'Reserva confirmada',
        EN_CURSO: 'Partido iniciado',
        COMPLETADA: 'Partido terminado',
        CANCELADA: 'Reserva cancelada',
      }
      toast.success(labels[vars.estado], { position: 'top-right' })
    },
  })
}

/**
 * Atajo: confirmar = cambiar estado a CONFIRMADA
 */
export function useConfirmarReserva() {
  const cambiar = useCambiarEstadoReserva()
  return {
    ...cambiar,
    mutate: (id: string) => cambiar.mutate({ id, estado: 'CONFIRMADA' }),
    mutateAsync: (id: string) => cambiar.mutateAsync({ id, estado: 'CONFIRMADA' }),
  }
}

/**
 * Backend: POST /reservas/:id/cancelar
 */
export function useCancelarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo?: string }) => {
      const { data } = await api.post<Reserva>(`/reservas/${id}/cancelar`, {
        motivo,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva cancelada', { position: 'top-right' })
    },
  })
}

/**
 * Backend: POST /reservas/:id/check-in
 */
export function useCheckInReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.post(`/reservas/${id}/check-in`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Partido iniciado', { position: 'top-right' })
    },
  })
}
