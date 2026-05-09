'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Tarifa, TipoTarifa } from '@/types'

export interface CreateTarifaInput {
  tipo: TipoTarifa
  precioHora: number
  horaInicio: string // HH:mm
  horaFin: string // HH:mm
}

export interface UpdateTarifaInput {
  tipo?: TipoTarifa
  precioHora?: number
  horaInicio?: string
  horaFin?: string
}

/** Backend: GET /canchas/:canchaId/tarifas (público — incluye override + heredadas) */
export function useTarifasByCancha(canchaId: string | undefined) {
  return useQuery<Tarifa[]>({
    queryKey: ['tarifas', 'byCancha', canchaId],
    queryFn: async () => {
      const { data } = await api.get<Tarifa[]>(`/canchas/${canchaId}/tarifas`)
      return data
    },
    enabled: !!canchaId,
  })
}

/** Backend: GET /tipos-cancha/:tipoCanchaId/tarifas (público — defaults del tipo) */
export function useTarifasByTipoCancha(tipoCanchaId: string | undefined) {
  return useQuery<Tarifa[]>({
    queryKey: ['tarifas', 'byTipoCancha', tipoCanchaId],
    queryFn: async () => {
      const { data } = await api.get<Tarifa[]>(
        `/tipos-cancha/${tipoCanchaId}/tarifas`,
      )
      return data
    },
    enabled: !!tipoCanchaId,
  })
}

/** Backend: POST /canchas/:canchaId/tarifas (override por cancha) */
export function useCrearTarifaCancha(canchaId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTarifaInput) => {
      const { data } = await api.post<Tarifa>(
        `/canchas/${canchaId}/tarifas`,
        input,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas'] })
      toast.success('Tarifa creada', { position: 'top-right' })
    },
  })
}

/** Backend: PATCH /tarifas/:id */
export function useEditarTarifa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; data: UpdateTarifaInput }) => {
      const { data } = await api.patch<Tarifa>(`/tarifas/${vars.id}`, vars.data)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas'] })
      toast.success('Tarifa actualizada', { position: 'top-right' })
    },
  })
}

/** Backend: DELETE /tarifas/:id */
export function useEliminarTarifa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tarifas/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarifas'] })
      toast.success('Tarifa eliminada', { position: 'top-right' })
    },
  })
}
