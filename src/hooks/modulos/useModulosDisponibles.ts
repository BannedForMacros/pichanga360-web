'use client'

import { useQuery } from '@tanstack/react-query'
import api, { tokenStore } from '@/lib/api'
import type { ModuloNodo } from '@/types'

export type Plataforma = 'WEB' | 'MOVIL'

/**
 * Backend: GET /modulos/disponibles?plataforma=WEB
 * Devuelve el árbol de módulos visibles para el usuario logueado, filtrado por:
 *  - plataforma
 *  - permisos del rol (RolPermiso)
 *  - PlanModulo del plan activo de su empresa (si pertenece a una)
 *
 * Usado por el Sidebar para pintarse desde el backend (NADA hardcodeado).
 */
export function useModulosDisponibles(plataforma: Plataforma = 'WEB') {
  return useQuery<ModuloNodo[]>({
    queryKey: ['modulos', 'disponibles', plataforma],
    queryFn: async () => {
      const { data } = await api.get<ModuloNodo[]>('/modulos/disponibles', {
        params: { plataforma },
      })
      return data
    },
    enabled: typeof window !== 'undefined' && !!tokenStore.getAccess(),
    staleTime: 1000 * 60 * 10,
  })
}
