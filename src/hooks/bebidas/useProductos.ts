'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Producto } from '@/types'

export function useProductos() {
  return useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await api.get<Producto[]>('/productos')
      return data
    },
  })
}
