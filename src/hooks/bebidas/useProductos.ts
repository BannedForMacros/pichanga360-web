'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Producto } from '@/types'

/**
 * Backend: GET /locales/:localId/productos (público)
 */
export function useProductosByLocal(localId: string | undefined) {
  return useQuery<Producto[]>({
    queryKey: ['productos', 'byLocal', localId],
    queryFn: async () => {
      const { data } = await api.get<Producto[]>(`/locales/${localId}/productos`)
      return data
    },
    enabled: !!localId,
  })
}
