'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CategoriaProducto } from '@/types'

/**
 * Backend: GET /categorias-producto (autenticado, scope por empresa)
 */
export function useCategoriasProducto() {
  return useQuery<CategoriaProducto[]>({
    queryKey: ['categorias-producto'],
    queryFn: async () => {
      const { data } = await api.get<CategoriaProducto[]>('/categorias-producto')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}
