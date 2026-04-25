'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Cancha } from '@/types'

export function useCrearCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Cancha>) => api.post('/canchas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      toast.success('Cancha creada correctamente', { position: 'top-right' })
    },
  })
}

export function useEditarCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cancha> }) =>
      api.put(`/canchas/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      toast.success('Cancha actualizada correctamente', { position: 'top-right' })
    },
  })
}

export function useEliminarCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/canchas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      toast.success('Cancha eliminada', { position: 'top-right' })
    },
  })
}
