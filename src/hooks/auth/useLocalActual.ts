'use client'

import { useLocalActualContext } from '@/contexts/LocalActualContext'

/**
 * Devuelve el localId/empresaId/rol del local actualmente seleccionado.
 *
 * La fuente de verdad es LocalActualContext (montado en el dashboard layout),
 * que combina:
 *   - el rol del usuario (si trae localId fijo, ese gana)
 *   - la selección persistida en localStorage
 *   - el primer local disponible
 *
 * Fuera del dashboard devuelve nulls sin romper.
 */
export function useLocalActual() {
  const { localId, empresaId, rol, isLoading } = useLocalActualContext()
  return { localId, empresaId, rol, isLoading }
}
