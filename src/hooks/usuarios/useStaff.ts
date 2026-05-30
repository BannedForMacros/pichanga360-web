'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { CrearOperadorInput, RolStaff, StaffMiembro } from '@/types/staff'

const KEY = ['usuarios', 'staff']

/**
 * Backend: GET /usuarios/staff
 * Lista el equipo (operadores y admins) de la empresa del usuario.
 */
export function useStaff() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await api.get<StaffMiembro[]>('/usuarios/staff')
      return data
    },
  })
}

/**
 * Backend: POST /usuarios/operador
 * Crea un empleado con email + contraseña y rol con alcance a un local.
 */
export function useCrearOperador() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CrearOperadorInput) => {
      const { data } = await api.post<StaffMiembro>('/usuarios/operador', input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Empleado agregado al equipo', { position: 'top-right' })
    },
  })
}

export interface AsignarRolInput {
  usuarioId: string
  rol: RolStaff
  empresaId?: string
  localId?: string
}

/** Backend: POST /usuarios/:id/roles */
export function useAsignarRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ usuarioId, ...body }: AsignarRolInput) => {
      const { data } = await api.post(`/usuarios/${usuarioId}/roles`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Rol asignado', { position: 'top-right' })
    },
  })
}

export interface QuitarRolInput {
  usuarioId: string
  asignacionId: string
}

/** Backend: DELETE /usuarios/:id/roles/:asignacionId */
export function useQuitarRol() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ usuarioId, asignacionId }: QuitarRolInput) =>
      api.delete(`/usuarios/${usuarioId}/roles/${asignacionId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY })
      toast.success('Acceso removido del equipo', { position: 'top-right' })
    },
  })
}
