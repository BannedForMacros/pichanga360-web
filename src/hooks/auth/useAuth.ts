'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { tokenStore } from '@/lib/api'
import toast from 'react-hot-toast'
import type { MeResponse, TokenResponse } from '@/types'
import type { LoginFormData, RegistroFormData } from '@/validators/auth/auth.schema'

export function useUsuarioActual() {
  return useQuery<MeResponse | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (typeof window === 'undefined') return null
      if (!tokenStore.getAccess()) return null
      const { data } = await api.get<MeResponse>('/auth/me')
      return data
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
