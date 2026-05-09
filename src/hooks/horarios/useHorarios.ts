'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { DiaSemana, HorarioCancha } from '@/types'

export interface CreateHorarioInput {
  diaSemana: DiaSemana
  horaApertura: string // HH:mm
  horaCierre: string // HH:mm
}

export interface UpdateHorarioInput {
  horaApertura?: string
  horaCierre?: string
}

/** Backend: GET /canchas/:canchaId/horarios (público) */
export function useHorariosByCancha(canchaId: string | undefined) {
  return useQuery<HorarioCancha[]>({
    queryKey: ['horarios', 'byCancha', canchaId],
    queryFn: async () => {
      const { data } = await api.get<HorarioCancha[]>(
        `/canchas/${canchaId}/horarios`,
      )
      return data
    },
    enabled: !!canchaId,
  })
}

/** Backend: POST /canchas/:canchaId/horarios (ADMIN_EMPRESA / ADMIN_LOCAL) */
export function useCrearHorario(canchaId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateHorarioInput) => {
      const { data } = await api.post<HorarioCancha>(
        `/canchas/${canchaId}/horarios`,
        input,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
      toast.success('Horario creado', { position: 'top-right' })
    },
  })
}

/** Backend: PATCH /horarios/:id */
export function useEditarHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; data: UpdateHorarioInput }) => {
      const { data } = await api.patch<HorarioCancha>(
        `/horarios/${vars.id}`,
        vars.data,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
      toast.success('Horario actualizado', { position: 'top-right' })
    },
  })
}

/** Backend: DELETE /horarios/:id */
export function useEliminarHorario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/horarios/${id}`)
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horarios'] })
      toast.success('Horario eliminado', { position: 'top-right' })
    },
  })
}
