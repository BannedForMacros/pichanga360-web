'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Reserva, EstadoReserva } from '@/types'

interface UseReservasParams {
  canchaId?: string
  estado?: EstadoReserva
  desde?: string
  hasta?: string
}

export function useReservas(params: UseReservasParams = {}) {
  return useQuery<Reserva[]>({
    queryKey: ['reservas', params],
    queryFn: async () => {
      const { data } = await api.get<Reserva[]>('/reservas', { params })
      return data
    },
  })
}
