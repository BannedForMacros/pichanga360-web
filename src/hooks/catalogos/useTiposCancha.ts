'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { TipoCancha } from '@/types'

/**
 * Backend: GET /tipos-cancha (autenticado, scope por empresa)
 */
export function useTiposCancha() {
  return useQuery<TipoCancha[]>({
    queryKey: ['tipos-cancha'],
    queryFn: async () => {
      const { data } = await api.get<TipoCancha[]>('/tipos-cancha')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}
