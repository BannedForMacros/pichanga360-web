'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type {
  CajaResumen,
  CajaSesion,
  EgresoCaja,
  MetodoPago,
} from '@/types'

const CAJA_KEY = ['caja']
const EGRESOS_KEY = ['egresos']

/**
 * Backend: GET /locales/:localId/caja/actual
 * Sesión de caja ABIERTA del local (o null si no hay ninguna), con sus egresos.
 */
export function useCajaActual(localId?: string) {
  return useQuery({
    queryKey: [...CAJA_KEY, 'actual', localId],
    enabled: !!localId,
    queryFn: async () => {
      const { data } = await api.get<CajaSesion | null>(
        `/locales/${localId}/caja/actual`,
      )
      return data
    },
  })
}

export interface AbrirCajaInput {
  localId: string
  montoInicial: number
  notaApertura?: string
}

/** Backend: POST /locales/:localId/caja/abrir */
export function useAbrirCaja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ localId, ...body }: AbrirCajaInput) => {
      const { data } = await api.post<CajaSesion>(
        `/locales/${localId}/caja/abrir`,
        body,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAJA_KEY })
      toast.success('Caja abierta', { position: 'top-right' })
    },
  })
}

export interface CerrarCajaInput {
  sesionId: string
  montoFinalContado: number
  notaCierre?: string
}

/** Backend: POST /caja/:sesionId/cerrar */
export function useCerrarCaja() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ sesionId, ...body }: CerrarCajaInput) => {
      const { data } = await api.post<CajaSesion>(
        `/caja/${sesionId}/cerrar`,
        body,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAJA_KEY })
      toast.success('Caja cerrada', { position: 'top-right' })
    },
  })
}

export interface EgresosRango {
  desde?: string // ISO
  hasta?: string // ISO
}

/** Backend: GET /locales/:localId/egresos?desde&hasta */
export function useEgresos(localId?: string, rango?: EgresosRango) {
  return useQuery({
    queryKey: [...EGRESOS_KEY, localId, rango?.desde, rango?.hasta],
    enabled: !!localId,
    queryFn: async () => {
      const { data } = await api.get<EgresoCaja[]>(
        `/locales/${localId}/egresos`,
        { params: { desde: rango?.desde, hasta: rango?.hasta } },
      )
      return data
    },
  })
}

/** Backend: GET /locales/:localId/caja/resumen?fecha → egresos del día + total. */
export function useCajaResumen(localId?: string, fecha?: string) {
  return useQuery({
    queryKey: [...CAJA_KEY, 'resumen', localId, fecha],
    enabled: !!localId,
    queryFn: async () => {
      const { data } = await api.get<CajaResumen>(
        `/locales/${localId}/caja/resumen`,
        { params: { fecha } },
      )
      return data
    },
  })
}

export interface RegistrarEgresoInput {
  localId: string
  concepto: string
  monto: number
  metodoPago?: MetodoPago
  cajaSesionId?: string
}

/** Backend: POST /locales/:localId/egresos */
export function useRegistrarEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ localId, ...body }: RegistrarEgresoInput) => {
      const { data } = await api.post<EgresoCaja>(
        `/locales/${localId}/egresos`,
        body,
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EGRESOS_KEY })
      qc.invalidateQueries({ queryKey: CAJA_KEY })
      toast.success('Egreso registrado', { position: 'top-right' })
    },
  })
}

/** Backend: DELETE /egresos/:id */
export function useEliminarEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/egresos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EGRESOS_KEY })
      qc.invalidateQueries({ queryKey: CAJA_KEY })
      toast.success('Egreso eliminado', { position: 'top-right' })
    },
  })
}
