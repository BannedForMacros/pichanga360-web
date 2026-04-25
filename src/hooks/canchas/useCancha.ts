'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Cancha } from '@/types'

export function useCancha(id: string | undefined) {
  return useQuery<Cancha>({
    queryKey: ['canchas', id],
    queryFn: async () => {
      const { data } = await api.get<Cancha>(`/canchas/${id}`)
      return data
    },
    enabled: !!id,
  })
}
