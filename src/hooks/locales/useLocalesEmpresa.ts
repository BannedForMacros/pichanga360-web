'use client'

import { useMemo } from 'react'
import { useLocales } from './useLocales'
import { useEmpresaActual } from '@/hooks/empresas/useEmpresaActual'
import type { Local } from '@/types'

/**
 * Lista de locales pertenecientes a la empresa del usuario logueado.
 * Se apoya en GET /locales (público, búsqueda) y filtra por empresa actual.
 *
 * Usado por el selector de local del sidebar y para resolver el localId actual.
 */
export function useLocalesEmpresa() {
  const { data: empresa, isLoading: loadingEmpresa } = useEmpresaActual()
  const { data: localesPaginated, isLoading: loadingLocales } = useLocales({
    limit: 100,
  })

  const locales = useMemo<Local[]>(() => {
    if (!empresa || !localesPaginated?.data) return []
    return localesPaginated.data.filter((l) => l.empresaId === empresa.id)
  }, [empresa, localesPaginated])

  return {
    locales,
    empresa,
    isLoading: loadingEmpresa || loadingLocales,
  }
}
