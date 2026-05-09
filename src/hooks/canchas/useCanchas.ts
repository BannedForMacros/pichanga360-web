'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Cancha } from '@/types'

/**
 * Lista de canchas de un local (endpoint público del backend).
 * Backend: GET /locales/:localId/canchas
 */
export function useCanchasByLocal(localId: string | undefined) {
  return useQuery<Cancha[]>({
    queryKey: ['canchas', 'byLocal', localId],
    queryFn: async () => {
      const { data } = await api.get<Cancha[]>(`/locales/${localId}/canchas`)
      return data
    },
    enabled: !!localId,
  })
}
