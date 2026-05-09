'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Local } from '@/types'
import type { LocalFormData } from '@/validators/locales/local.schema'

/**
 * Backend: POST /locales (ADMIN_EMPRESA).
 * Crea un local nuevo bajo la empresa del usuario logueado.
 */
export function useCrearLocal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: LocalFormData) => {
      const payload = {
        ...input,
        pais: input.pais && input.pais.length > 0 ? input.pais : 'Perú',
      }
      const { data } = await api.post<Local>('/locales', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locales'] })
      toast.success('Local creado correctamente', { position: 'top-right' })
    },
  })
}

/**
 * Backend: PATCH /locales/:id (ADMIN_EMPRESA / ADMIN_LOCAL).
 */
export function useEditarLocal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; data: Partial<LocalFormData> }) => {
      const { data } = await api.patch<Local>(`/locales/${vars.id}`, vars.data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locales'] })
      toast.success('Local actualizado', { position: 'top-right' })
    },
  })
}

/**
 * Backend: DELETE /locales/:id (ADMIN_EMPRESA, soft delete).
 */
export function useEliminarLocal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/locales/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locales'] })
      toast.success('Local eliminado', { position: 'top-right' })
    },
  })
}
