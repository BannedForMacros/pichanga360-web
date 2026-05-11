'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { TipoCancha } from '@/types'

export interface CreateTipoCanchaInput {
  deporteId: string
  nombre: string
  capacidadDefault: number
  descripcion?: string
}

export interface UpdateTipoCanchaInput {
  deporteId?: string
  nombre?: string
  capacidadDefault?: number
  descripcion?: string
  activo?: boolean
}

/** Backend: POST /tipos-cancha (permiso tipos-cancha:crear) */
export function useCrearTipoCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTipoCanchaInput) => {
      const payload = {
        ...input,
        descripcion: input.descripcion?.length ? input.descripcion : undefined,
      }
      const { data } = await api.post<TipoCancha>('/tipos-cancha', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-cancha'] })
      toast.success('Tipo de cancha creado', { position: 'top-right' })
    },
  })
}

/** Backend: PATCH /tipos-cancha/:id */
export function useEditarTipoCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; data: UpdateTipoCanchaInput }) => {
      const { data } = await api.patch<TipoCancha>(
        `/tipos-cancha/${vars.id}`,
        vars.data,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-cancha'] })
      toast.success('Tipo de cancha actualizado', { position: 'top-right' })
    },
  })
}

/** Backend: DELETE /tipos-cancha/:id */
export function useEliminarTipoCancha() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tipos-cancha/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-cancha'] })
      toast.success('Tipo de cancha eliminado', { position: 'top-right' })
    },
  })
}
