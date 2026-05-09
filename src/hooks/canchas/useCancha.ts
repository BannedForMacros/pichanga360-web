'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Cancha } from '@/types'

/**
 * Detalle público de una cancha.
 * Backend: GET /canchas/:id
 */
export function useCancha(id: string | undefined) {
  return useQuery<Cancha>({
    queryKey: ['canchas', id],
    queryFn: async () => {
      const { data } = await api.get<Cancha>(`/canchas/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export interface DisponibilidadSlot {
  inicio: string
  fin: string
  disponible: boolean
}

/**
 * Disponibilidad horaria de la cancha en una fecha concreta.
 * Backend: GET /canchas/:id/disponibilidad?fecha=YYYY-MM-DD
 */
export function useDisponibilidadCancha(
  id: string | undefined,
  fecha: string | undefined
) {
  return useQuery<DisponibilidadSlot[]>({
    queryKey: ['canchas', id, 'disponibilidad', fecha],
    queryFn: async () => {
      const { data } = await api.get<DisponibilidadSlot[]>(
        `/canchas/${id}/disponibilidad`,
        { params: { fecha } }
      )
      return data
    },
    enabled: !!id && !!fecha,
  })
}
