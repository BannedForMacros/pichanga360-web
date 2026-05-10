'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api, { tokenStore } from '@/lib/api'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import type { MetodoPago, PagoReserva } from '@/types'
import type { RegistrarPagoSuscripcionFormData } from '@/validators/suscripciones/pago-suscripcion.schema'

// Reusamos el shape "PagoReserva" porque la estructura del PagoSuscripcion del
// backend (id, suscripcionId, monto, metodoPago, estado, referencia, fechaPago,
// periodoInicio, periodoFin) es muy similar — el dashboard solo necesita los
// campos comunes.
export interface PagoSuscripcion {
  id: string
  suscripcionId: string
  monto: number | string
  metodoPago: MetodoPago
  estado: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO' | 'DEVUELTO'
  referencia: string | null
  fechaPago: string | null
  periodoInicio: string
  periodoFin: string
  createdAt: string
}

const ROLES_PAGOS = ['ADMIN_EMPRESA', 'SUPER_ADMIN'] as const

/** Backend: GET /pagos-suscripcion?suscripcionId */
export function usePagosSuscripcion(suscripcionId?: string) {
  const { data: me } = useUsuarioActual()
  const habilitado =
    me?.roles?.some((r) =>
      ROLES_PAGOS.includes(r.rol as (typeof ROLES_PAGOS)[number]),
    ) ?? false

  return useQuery<PagoSuscripcion[]>({
    queryKey: ['pagos-suscripcion', suscripcionId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<PagoSuscripcion[]>('/pagos-suscripcion', {
        params: suscripcionId ? { suscripcionId } : undefined,
      })
      return data
    },
    enabled:
      typeof window !== 'undefined' &&
      !!tokenStore.getAccess() &&
      habilitado,
    retry: false,
  })
}

/** Backend: POST /pagos-suscripcion */
export function useRegistrarPagoSuscripcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegistrarPagoSuscripcionFormData) => {
      const payload = {
        ...input,
        referencia: input.referencia?.length ? input.referencia : undefined,
        // El backend espera ISO strings completos para periodoInicio/Fin
        periodoInicio: new Date(input.periodoInicio).toISOString(),
        periodoFin: new Date(input.periodoFin).toISOString(),
      }
      const { data } = await api.post<PagoSuscripcion>(
        '/pagos-suscripcion',
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagos-suscripcion'] })
      queryClient.invalidateQueries({ queryKey: ['suscripciones'] })
      toast.success('Pago registrado', { position: 'top-right' })
    },
  })
}

// PagoReserva es un shape similar pero del módulo de reservas — lo dejamos
// reexportado para que el resto del frontend siga teniendo el tipo central.
export type { PagoReserva }
