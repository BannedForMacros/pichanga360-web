'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { tokenStore } from '@/lib/api'
import toast from 'react-hot-toast'
import type { MeResponse, TipoRol, TokenResponse, Usuario } from '@/types'
import type {
  LoginFormData,
  RegistroEmpresaFormData,
  RegistroFormData,
} from '@/validators/auth/auth.schema'
import type { CambiarPasswordFormData } from '@/validators/auth/cambiar-password.schema'

/**
 * Shape "crudo" que devuelve el backend en GET /auth/me.
 * Notar que `rol` viene como objeto { codigo, nombre } — distinto del
 * TokenResponse de /auth/login donde `rol` es directamente un string.
 * Lo normalizamos al shape plano `MeResponse` que el resto del frontend
 * (LocalActualContext, DashboardGuard, useLocalActual, etc.) ya consume.
 */
interface RawMeResponse {
  user: Usuario
  roles: Array<{
    rol: { codigo: TipoRol; nombre: string }
    empresaId: string | null
    localId: string | null
    empresa?: { id: string; nombre: string } | null
    local?: { id: string; nombre: string } | null
  }>
}

export function useUsuarioActual() {
  return useQuery<MeResponse | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (typeof window === 'undefined') return null
      if (!tokenStore.getAccess()) return null
      const { data } = await api.get<RawMeResponse>('/auth/me')
      return {
        user: data.user,
        roles: data.roles.map((r) => ({
          rol: r.rol.codigo,
          empresaId: r.empresaId,
          localId: r.localId,
        })),
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: LoginFormData) => {
      const { data } = await api.post<TokenResponse>('/auth/login', input)
      return data
    },
    onSuccess: (data) => {
      tokenStore.set(data.accessToken, data.refreshToken)
      queryClient.setQueryData(['auth', 'me'], { user: data.user, roles: data.roles })
      toast.success(`Bienvenido, ${data.user.nombre}`, { position: 'top-right' })
    },
  })
}

export function useRegistro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegistroFormData) => {
      // Filtramos confirmarPassword: el backend rechaza props extras
      const { confirmarPassword: _ignored, ...payload } = input
      const { data } = await api.post<TokenResponse>('/auth/register', payload)
      return data
    },
    onSuccess: (data) => {
      tokenStore.set(data.accessToken, data.refreshToken)
      queryClient.setQueryData(['auth', 'me'], { user: data.user, roles: data.roles })
      toast.success('¡Cuenta creada con éxito!', { position: 'top-right' })
    },
  })
}

export function useRegistroEmpresa() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegistroEmpresaFormData) => {
      // El backend rechaza props extras (whitelist + forbidNonWhitelisted),
      // así que filtramos los campos puramente del formulario.
      const {
        confirmarPassword: _ignoreConfirm,
        aceptoTerminos: _ignoreAcepto,
        telefono,
        logoUrl,
        ...rest
      } = input
      const payload = {
        ...rest,
        telefono: telefono || undefined,
        logoUrl: logoUrl || undefined,
      }
      const { data } = await api.post<TokenResponse>(
        '/auth/register-empresa',
        payload,
      )
      return data
    },
    onSuccess: (data) => {
      tokenStore.set(data.accessToken, data.refreshToken)
      queryClient.setQueryData(['auth', 'me'], { user: data.user, roles: data.roles })
      toast.success(`¡Bienvenido a Pichanga360, ${data.user.nombre}!`, {
        position: 'top-right',
      })
    },
  })
}

export function useCambiarPassword() {
  return useMutation({
    mutationFn: async (input: CambiarPasswordFormData) => {
      // El backend (ChangePasswordDto) solo acepta passwordActual y passwordNueva.
      // Filtramos confirmarPassword (whitelist + forbidNonWhitelisted).
      const payload = {
        passwordActual: input.passwordActual,
        passwordNueva: input.passwordNueva,
      }
      await api.post('/auth/change-password', payload)
    },
    onSuccess: () => {
      toast.success('Contraseña actualizada', { position: 'top-right' })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return async () => {
    const refreshToken = tokenStore.getRefresh()
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken })
      } catch {
        /* ignorar errores en logout */
      }
    }
    tokenStore.clear()
    queryClient.setQueryData(['auth', 'me'], null)
    queryClient.clear()
    toast.success('Sesión cerrada', { position: 'top-right' })
    if (typeof window !== 'undefined') window.location.href = '/login'
  }
}
