'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Usuario } from '@/types'

export function useClientes() {
  return useQuery<Usuario[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data } = await api.get<Usuario[]>('/clientes')
      return data
    },
  })
}
