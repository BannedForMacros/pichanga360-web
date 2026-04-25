'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Cancha, Deporte } from '@/types'

interface UseCanchasParams {
  deporte?: Deporte
  distrito?: string
  precioMin?: number
  precioMax?: number
  q?: string
}

export function useCanchas(params: UseCanchasParams = {}) {
  return useQuery<Cancha[]>({
    queryKey: ['canchas', params],
    queryFn: async () => {
      const { data } = await api.get<Cancha[]>('/canchas', { params })
      return data
    },
  })
}
