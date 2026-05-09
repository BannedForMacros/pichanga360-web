'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Cancha, EstadoCancha } from '@/types'

export interface CreateCanchaInput {
  nombre: string
  superficieId: string
  tipoCanchaId?: string
  capacidadJugadores?: number
  fotos?: string[]
}

export interface UpdateCanchaInput {
  nombre?: string
  superficieId?: string
  tipoCanchaId?: string
  capacidadJugadores?: number
  fotos?: string[]
  estado?: EstadoCancha
}

/**
 * Backend: POST /locales/:localId/canchas
 */
export function useCrearCancha(localId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCanchaInput) => {
      const { data: cancha } = await api.post<Cancha>(
        `/locales/${localId}/canchas`,
        data
      )
      return cancha
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      toast.success('Cancha creada correctamente', { position: 'top-right' })
    },
  })
}

/**
 * Backend: PATCH /canchas/:id
 */
export function useEditarCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCanchaInput }) => {
      const { data: cancha } = await api.patch<Cancha>(`/canchas/${id}`, data)
      return cancha
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canchas'] })
      toast.success('Cancha actualizada correctamente', { position: 'top-right' })
    },
  })
}

/**
 * Backend: DELETE /canchas/:id (soft delete)
 */
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
