'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Producto } from '@/types'

export interface CreateProductoInput {
  nombre: string
  categoriaId: string
  precio: number
  stock?: number
  imagenUrl?: string
}

export interface UpdateProductoInput {
  nombre?: string
  categoriaId?: string
  precio?: number
  imagenUrl?: string
  activo?: boolean
}

/**
 * Backend: POST /locales/:localId/productos
 */
export function useCrearProducto(localId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProductoInput) => {
      const { data: producto } = await api.post<Producto>(
        `/locales/${localId}/productos`,
        data
      )
      return producto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto creado correctamente', { position: 'top-right' })
    },
  })
}

/**
 * Backend: PATCH /productos/:id
 */
export function useEditarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateProductoInput
    }) => {
      const { data: producto } = await api.patch<Producto>(
        `/productos/${id}`,
        data
      )
      return producto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto actualizado', { position: 'top-right' })
    },
  })
}

/**
 * Backend: DELETE /productos/:id
 */
export function useEliminarProducto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/productos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Producto eliminado', { position: 'top-right' })
    },
  })
}

/**
 * Backend: PATCH /productos/:id/stock
 * Body: { delta: number }
 */
export function useAjustarStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) =>
      api.patch(`/productos/${id}/stock`, { delta }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] })
      toast.success('Stock actualizado', { position: 'top-right' })
    },
  })
}
