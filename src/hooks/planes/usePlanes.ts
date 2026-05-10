'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Plan } from '@/types'

/** Backend: GET /planes (público) */
export function usePlanes() {
  return useQuery<Plan[]>({
    queryKey: ['planes'],
    queryFn: async () => {
      const { data } = await api.get<Plan[]>('/planes')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}
