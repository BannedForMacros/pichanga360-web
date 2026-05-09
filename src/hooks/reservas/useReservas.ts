'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { EstadoReserva, Paginated, Reserva } from '@/types'

export interface FilterReservas {
  page?: number
  limit?: number
  estado?: EstadoReserva
  canchaId?: string
  localId?: string
  desde?: string
  hasta?: string
}

/**
 * Backend: GET /reservas (paginado, filtrable)
 */
export function useReservas(params: FilterReservas = {}) {
  return useQuery<Paginated<Reserva>>({
    queryKey: ['reservas', params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Reserva>>('/reservas', { params })
      return data
    },
  })
}

/**
 * Backend: GET /reservas/:id
 */
export function useReserva(id: string | undefined) {
  return useQuery<Reserva>({
    queryKey: ['reservas', id],
    queryFn: async () => {
      const { data } = await api.get<Reserva>(`/reservas/${id}`)
      return data
    },
    enabled: !!id,
  })
}
