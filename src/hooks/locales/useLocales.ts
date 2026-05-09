'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Local, Paginated } from '@/types'

export interface FilterLocales {
  page?: number
  limit?: number
  distrito?: string
  provincia?: string
  departamento?: string
  deporteCodigo?: string
  lat?: number
  lng?: number
  radioKm?: number
}

/**
 * Backend: GET /locales (público, búsqueda con filtros geográficos)
 */
export function useLocales(params: FilterLocales = {}) {
  return useQuery<Paginated<Local>>({
    queryKey: ['locales', params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Local>>('/locales', { params })
      return data
    },
  })
}

/**
 * Backend: GET /locales/:id (público, detalle con canchas, tarifas y horarios)
 */
export function useLocal(id: string | undefined) {
  return useQuery<Local>({
    queryKey: ['locales', id],
    queryFn: async () => {
      const { data } = await api.get<Local>(`/locales/${id}`)
      return data
    },
    enabled: !!id,
  })
}
