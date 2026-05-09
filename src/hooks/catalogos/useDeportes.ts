'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Deporte } from '@/types'

/**
 * Backend: GET /deportes (público)
 */
export function useDeportes() {
  return useQuery<Deporte[]>({
    queryKey: ['deportes'],
    queryFn: async () => {
      const { data } = await api.get<Deporte[]>('/deportes')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}
