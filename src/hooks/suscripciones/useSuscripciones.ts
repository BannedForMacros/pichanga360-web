'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api, { tokenStore } from '@/lib/api'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import type { Plan, Suscripcion } from '@/types'

const ROLES_CON_SUSCRIPCION = ['ADMIN_EMPRESA', 'SUPER_ADMIN'] as const

/**
 * Backend: GET /suscripciones/me (ADMIN_EMPRESA, SUPER_ADMIN).
 * Devuelve TODAS las suscripciones de la empresa, ordenadas desc por createdAt.
 * La activa es típicamente la primera con estado='ACTIVA'.
 */
export function useSuscripcionesActuales() {
  const { data: me } = useUsuarioActual()
  const habilitado =
    me?.roles?.some((r) =>
      ROLES_CON_SUSCRIPCION.includes(
        r.rol as (typeof ROLES_CON_SUSCRIPCION)[number],
      ),
    ) ?? false

  return useQuery<(Suscripcion & { plan?: Plan })[]>({
    queryKey: ['suscripciones', 'me'],
    queryFn: async () => {
      const { data } = await api.get<(Suscripcion & { plan?: Plan })[]>(
        '/suscripciones/me',
      )
      return data
    },
    enabled:
      typeof window !== 'undefined' &&
      !!tokenStore.getAccess() &&
      habilitado,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

/** Backend: POST /suscripciones/cambiar-plan */
export function useCambiarPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { planId: string; renovacionAutomatica?: boolean }) => {
      const { data } = await api.post<Suscripcion>(
        '/suscripciones/cambiar-plan',
        vars,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suscripciones'] })
      queryClient.invalidateQueries({ queryKey: ['modulos'] })
      toast.success('Plan actualizado', { position: 'top-right' })
    },
  })
}

/** Backend: POST /suscripciones/:id/renovar */
export function useRenovarSuscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; diasExtension?: number }) => {
      const { data } = await api.post<Suscripcion>(
        `/suscripciones/${vars.id}/renovar`,
        { diasExtension: vars.diasExtension },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suscripciones'] })
      toast.success('Suscripción renovada', { position: 'top-right' })
    },
  })
}

/** Backend: POST /suscripciones/:id/cancelar */
export function useCancelarSuscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Suscripcion>(
        `/suscripciones/${id}/cancelar`,
        {},
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suscripciones'] })
      toast.success('Suscripción cancelada', { position: 'top-right' })
    },
  })
}
