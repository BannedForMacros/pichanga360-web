'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Paginated, Usuario } from '@/types'

/**
 * Backend: GET /usuarios (paginado, requiere permiso usuarios.ver)
 * En el dashboard llamamos a estos como "clientes" pero el backend los expone
 * en /usuarios. La distinción cliente/operador/admin se ve en sus roles.
 */
export function useClientes(params: { page?: number; limit?: number } = {}) {
  return useQuery<Paginated<Usuario>>({
    queryKey: ['usuarios', params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Usuario>>('/usuarios', { params })
      return data
    },
  })
}
