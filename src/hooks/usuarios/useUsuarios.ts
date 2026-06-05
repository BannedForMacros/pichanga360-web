'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api, { tokenStore } from '@/lib/api'
import type { Paginated, Usuario } from '@/types'
import type { ClienteWalkinFormData } from '@/validators/usuarios/walkin.schema'

/**
 * Backend: GET /usuarios?search=&limit=  (paginado, requiere permiso usuarios:ver).
 * Lo usa el dueño para buscar un cliente existente al crear una reserva.
 */
export function useBuscarUsuarios(search: string, limit = 10) {
  return useQuery<Paginated<Usuario>>({
    queryKey: ['usuarios', 'buscar', search, limit],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Usuario>>('/usuarios', {
        params: { search, limit },
      })
      return data
    },
    enabled:
      typeof window !== 'undefined' &&
      !!tokenStore.getAccess() &&
      search.trim().length >= 2,
    staleTime: 1000 * 30,
  })
}

/**
 * Backend: POST /usuarios/walkin (admin/operador). Crea cliente walk-in.
 * Si no se envía email, el backend genera uno placeholder.
 */
export function useCrearClienteWalkin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ClienteWalkinFormData) => {
      const esEmpresa = input.tipoDocumento === 'RUC'
      // Para una empresa (RUC) el "nombre" del usuario es la razón social y no
      // hay apellido; para una persona se usan nombre y apellido normales.
      const payload = {
        nombre: (esEmpresa ? input.razonSocial : input.nombre)?.trim() || '',
        apellido: esEmpresa ? undefined : input.apellido?.trim() || undefined,
        telefono: input.telefono?.length ? input.telefono : undefined,
        email: input.email?.length ? input.email : undefined,
        tipoDocumento: input.tipoDocumento || undefined,
        numeroDocumento: input.numeroDocumento?.length
          ? input.numeroDocumento
          : undefined,
        razonSocial: esEmpresa ? input.razonSocial?.trim() || undefined : undefined,
      }
      const { data } = await api.post<Usuario>('/usuarios/walkin', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast.success('Cliente creado', { position: 'top-right' })
    },
  })
}
