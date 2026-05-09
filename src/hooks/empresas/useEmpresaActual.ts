'use client'

import { useQuery } from '@tanstack/react-query'
import api, { tokenStore } from '@/lib/api'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import type { Empresa } from '@/types'

const ROLES_CON_EMPRESA = ['ADMIN_EMPRESA', 'ADMIN_LOCAL', 'OPERADOR'] as const

/**
 * Backend: GET /empresas/me (ADMIN_EMPRESA, ADMIN_LOCAL, OPERADOR).
 *
 * Solo se dispara si el usuario tiene un rol que pueda consumirlo. Para
 * SUPER_ADMIN o CLIENTE el endpoint daría 403 (y dispararía un toast de
 * permisos en el interceptor), así que ni siquiera lo intentamos.
 */
export function useEmpresaActual() {
  const { data: me } = useUsuarioActual()
  const tieneRolDeEmpresa =
    me?.roles?.some((r) => ROLES_CON_EMPRESA.includes(r.rol as (typeof ROLES_CON_EMPRESA)[number])) ?? false

  return useQuery<Empresa | null>({
    queryKey: ['empresas', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Empresa>('/empresas/me')
      return data
    },
    enabled:
      typeof window !== 'undefined' &&
      !!tokenStore.getAccess() &&
      tieneRolDeEmpresa,
    retry: false,
    staleTime: 1000 * 60 * 10,
  })
}
