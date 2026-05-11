'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Resena } from '@/types'
import type { ResenaFormData } from '@/validators/reservas/resena.schema'

/** Backend: GET /canchas/:canchaId/resenas (público) */
export function useResenasCancha(canchaId: string | undefined) {
  return useQuery<Resena[]>({
    queryKey: ['resenas', 'cancha', canchaId],
    queryFn: async () => {
      const { data } = await api.get<Resena[]>(`/canchas/${canchaId}/resenas`)
      return data
    },
    enabled: !!canchaId,
  })
}

/** Backend: GET /locales/:localId/resenas (público) */
export function useResenasLocal(localId: string | undefined) {
  return useQuery<Resena[]>({
    queryKey: ['resenas', 'local', localId],
    queryFn: async () => {
      const { data } = await api.get<Resena[]>(`/locales/${localId}/resenas`)
      return data
    },
    enabled: !!localId,
  })
}

/** Backend: POST /reservas/:reservaId/resena */
export function useCrearResena() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { reservaId: string; data: ResenaFormData }) => {
      const payload = {
        ...vars.data,
        comentario: vars.data.comentario?.length
          ? vars.data.comentario
          : undefined,
      }
      const { data } = await api.post<Resena>(
        `/reservas/${vars.reservaId}/resena`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resenas'] })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('¡Gracias por tu reseña!', { position: 'top-right' })
    },
  })
}
