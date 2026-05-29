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
