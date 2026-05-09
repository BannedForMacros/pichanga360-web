'use client'

import { useUsuarioActual } from './useAuth'

/**
 * Devuelve el primer localId/empresaId que el usuario tiene en sus roles.
 *
 * Más adelante esto puede convertirse en un selector global (cuando un usuario
 * tiene múltiples locales/empresas), pero para esta fase tomamos el primer
 * scope que encontramos.
 */
export function useLocalActual() {
  const { data, isLoading } = useUsuarioActual()

  const conLocal = data?.roles?.find((r) => r.localId)
  const conEmpresa = data?.roles?.find((r) => r.empresaId)

  return {
    isLoading,
    localId: conLocal?.localId ?? null,
    empresaId: conLocal?.empresaId ?? conEmpresa?.empresaId ?? null,
    rol: conLocal?.rol ?? conEmpresa?.rol ?? data?.roles?.[0]?.rol ?? null,
  }
}
