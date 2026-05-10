'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api, { tokenStore } from '@/lib/api'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import type { Empresa, TelefonoEmpresa } from '@/types'
import type {
  TelefonoEmpresaFormData,
  UpdateEmpresaFormData,
} from '@/validators/empresas/empresa.schema'

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

/** Backend: PATCH /empresas/me (ADMIN_EMPRESA) */
export function useEditarEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateEmpresaFormData) => {
      const payload = {
        ...input,
        logoUrl: input.logoUrl?.length ? input.logoUrl : undefined,
      }
      const { data } = await api.patch<Empresa>('/empresas/me', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      toast.success('Empresa actualizada', { position: 'top-right' })
    },
  })
}

/** Backend: POST /empresas/me/telefonos (ADMIN_EMPRESA) */
export function useAgregarTelefonoEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: TelefonoEmpresaFormData) => {
      const { data } = await api.post<TelefonoEmpresa>(
        '/empresas/me/telefonos',
        input,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      toast.success('Teléfono agregado', { position: 'top-right' })
    },
  })
}

/** Backend: DELETE /empresas/me/telefonos/:id (ADMIN_EMPRESA) */
export function useEliminarTelefonoEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (telefonoId: string) => {
      await api.delete(`/empresas/me/telefonos/${telefonoId}`)
      return telefonoId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] })
      toast.success('Teléfono eliminado', { position: 'top-right' })
    },
  })
}
