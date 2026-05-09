'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Superficie } from '@/types'

/**
 * Backend: GET /superficies (público)
 */
export function useSuperficies() {
  return useQuery<Superficie[]>({
    queryKey: ['superficies'],
    queryFn: async () => {
      const { data } = await api.get<Superficie[]>('/superficies')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}
