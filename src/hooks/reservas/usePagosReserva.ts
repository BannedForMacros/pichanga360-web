'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { PagoReserva } from '@/types'
import type { RegistrarPagoReservaFormData } from '@/validators/reservas/pago-reserva.schema'

/** Backend: GET /reservas/:reservaId/pagos */
export function usePagosReserva(reservaId: string | undefined) {
  return useQuery<PagoReserva[]>({
    queryKey: ['pagos-reserva', reservaId],
    queryFn: async () => {
      const { data } = await api.get<PagoReserva[]>(
        `/reservas/${reservaId}/pagos`,
      )
      return data
    },
    enabled: !!reservaId,
  })
}

/** Backend: POST /reservas/:reservaId/pagos */
export function useRegistrarPagoReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      reservaId: string
      data: RegistrarPagoReservaFormData
    }) => {
      const payload = {
        ...vars.data,
        referencia: vars.data.referencia?.length
          ? vars.data.referencia
          : undefined,
      }
      const { data } = await api.post<PagoReserva>(
        `/reservas/${vars.reservaId}/pagos`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos-reserva'] })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Pago registrado', { position: 'top-right' })
    },
  })
}

/** Backend: PATCH /pagos-reserva/:id/confirmar (operador/admin) */
export function useConfirmarPagoReserva() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: string; referencia?: string }) => {
      const params = vars.referencia
        ? `?referencia=${encodeURIComponent(vars.referencia)}`
        : ''
      const { data } = await api.patch<PagoReserva>(
        `/pagos-reserva/${vars.id}/confirmar${params}`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos-reserva'] })
      queryClient.invalidateQueries({ queryKey: ['reservas'] })
      toast.success('Pago confirmado', { position: 'top-right' })
    },
  })
}
