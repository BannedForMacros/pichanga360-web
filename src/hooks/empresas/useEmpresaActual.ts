'use client'

import { useQuery } from '@tanstack/react-query'
import api, { tokenStore } from '@/lib/api'
import type { Empresa } from '@/types'

/**
 * Backend: GET /empresas/me (ADMIN_EMPRESA, ADMIN_LOCAL, OPERADOR)
 * Devuelve la empresa del usuario logueado con sus teléfonos.
 */
export function useEmpresaActual() {
  return useQuery<Empresa | null>({
    queryKey: ['empresas', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Empresa>('/empresas/me')
      return data
    },
    enabled: typeof window !== 'undefined' && !!tokenStore.getAccess(),
    retry: false,
    staleTime: 1000 * 60 * 10,
  })
}
