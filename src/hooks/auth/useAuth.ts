'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Usuario } from '@/types'
import type { LoginFormData, RegistroFormData } from '@/validators/auth/auth.schema'

interface AuthResponse {
  token: string
  usuario: Usuario
}

export function useUsuarioActual() {
  return useQuery<Usuario | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (typeof window === 'undefined') return null
      const token = localStorage.getItem('token')
      if (!token) return null
      const { data } = await api.get<Usuario>('/auth/me')
      return data
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: LoginFormData) => {
      const { data } = await api.post<AuthResponse>('/auth/login', input)
      return data
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token)
      queryClient.setQueryData(['auth', 'me'], data.usuario)
      toast.success(`Bienvenido, ${data.usuario.nombre}`, { position: 'top-right' })
    },
  })
}

export function useRegistro() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegistroFormData) => {
      const { data } = await api.post<AuthResponse>('/auth/registro', input)
      return data
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') localStorage.setItem('token', data.token)
      queryClient.setQueryData(['auth', 'me'], data.usuario)
      toast.success('¡Cuenta creada con éxito!', { position: 'top-right' })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token')
    queryClient.setQueryData(['auth', 'me'], null)
    queryClient.clear()
    toast.success('Sesión cerrada', { position: 'top-right' })
  }
}
