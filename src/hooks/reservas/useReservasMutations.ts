'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Reserva } from '@/types'

export function useCrearReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Reserva>) => api.post('/reservas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva creada correctamente', { position: 'top-right' })
    },
  })
}

export function useEditarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reserva> }) =>
      api.put(`/reservas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva actualizada', { position: 'top-right' })
    },
  })
}

export function useCancelarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reservas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva cancelada', { position: 'top-right' })
    },
  })
}

export function useConfirmarReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/reservas/${id}/confirmar`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Reserva confirmada', { position: 'top-right' })
    },
  })
}
