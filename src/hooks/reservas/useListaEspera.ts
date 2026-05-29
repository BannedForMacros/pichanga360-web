'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { ListaEspera } from '@/types'

const KEY = ['lista-espera']

/**
 * Backend: GET /canchas/:canchaId/lista-espera
 * Cola de clientes en espera para una cancha (ordenada por fecha y posición).
 */
export function useListaEsperaByCancha(canchaId?: string) {
  return useQuery({
    queryKey: [...KEY, canchaId],
    enabled: !!canchaId,
    queryFn: async () => {
      const { data } = await api.get<ListaEspera[]>(
        `/canchas/${canchaId}/lista-espera`,
      )
      return data
    },
  })
}

export interface AgregarListaEsperaInput {
  canchaId: string
  clienteId: string
  fechaInicio: string // ISO
  fechaFin: string // ISO
}

/**
 * Backend: POST /canchas/:canchaId/lista-espera
 * El dueño/operador anota a un cliente del negocio en la cola de un horario.
 */
export function useAgregarListaEspera() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ canchaId, ...body }: AgregarListaEsperaInput) => {
      const { data } = await api.post<ListaEspera>(
        `/canchas/${canchaId}/lista-espera`,
        body,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Cliente agregado a la lista de espera', {
        position: 'top-right',
      })
    },
  })
}

/** Backend: DELETE /lista-espera/:id */
export function useEliminarListaEspera() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lista-espera/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Quitado de la lista de espera', { position: 'top-right' })
    },
  })
}
