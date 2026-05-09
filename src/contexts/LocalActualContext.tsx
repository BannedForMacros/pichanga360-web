'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import { useLocalesEmpresa } from '@/hooks/locales/useLocalesEmpresa'
import type { Local, RolAsignacion, TipoRol } from '@/types'

const STORAGE_KEY = 'pichanga.localActualId'

interface LocalActualValue {
  /** Lista de locales que el usuario puede operar (de su empresa) */
  locales: Local[]
  /** Local actualmente seleccionado */
  local: Local | null
  localId: string | null
  empresaId: string | null
  rol: TipoRol | null
  /** Cambiar la selección (persiste en localStorage) */
  setLocalId: (id: string | null) => void
  isLoading: boolean
}

const LocalActualContext = createContext<LocalActualValue | null>(null)

function pickRol(roles: RolAsignacion[] | undefined, localId: string | null) {
  if (!roles?.length) return null
  if (localId) {
    const r = roles.find((x) => x.localId === localId)
    if (r) return r.rol
  }
  return (
    roles.find((r) => r.localId)?.rol ??
    roles.find((r) => r.empresaId)?.rol ??
    roles[0]?.rol ??
    null
  )
}

export function LocalActualProvider({ children }: { children: ReactNode }) {
  const { data: me } = useUsuarioActual()
  const { locales, empresa, isLoading } = useLocalesEmpresa()

  const [storedId, setStoredId] = useState<string | null>(null)

  // Hidratamos desde localStorage solo en cliente, para evitar mismatch en SSR
  useEffect(() => {
    if (typeof window === 'undefined') return
    setStoredId(localStorage.getItem(STORAGE_KEY))
  }, [])

  const setLocalId = useCallback((id: string | null) => {
    setStoredId(id)
    if (typeof window === 'undefined') return
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Resolución del local activo:
  // 1) si el rol del usuario tiene un localId fijo (ADMIN_LOCAL/OPERADOR), ese gana
  // 2) si la selección guardada existe en la lista, esa
  // 3) primer local de la lista
  const localId = useMemo<string | null>(() => {
    const fromRole = me?.roles?.find((r) => r.localId)?.localId ?? null
    if (fromRole) return fromRole
    if (storedId && locales.some((l) => l.id === storedId)) return storedId
    return locales[0]?.id ?? null
  }, [me, locales, storedId])

  const local = useMemo<Local | null>(
    () => locales.find((l) => l.id === localId) ?? null,
    [locales, localId],
  )

  const empresaId =
    empresa?.id ?? me?.roles?.find((r) => r.empresaId)?.empresaId ?? null

  const rol = pickRol(me?.roles, localId)

  const value: LocalActualValue = {
    locales,
    local,
    localId,
    empresaId,
    rol,
    setLocalId,
    isLoading,
  }

  return (
    <LocalActualContext.Provider value={value}>
      {children}
    </LocalActualContext.Provider>
  )
}

export function useLocalActualContext(): LocalActualValue {
  const ctx = useContext(LocalActualContext)
  if (ctx) return ctx
  // Fallback seguro fuera del provider (p.ej. zonas públicas) — sin locales,
  // mantenemos el contrato para que los hooks consumidores no truenen.
  return {
    locales: [],
    local: null,
    localId: null,
    empresaId: null,
    rol: null,
    setLocalId: () => {},
    isLoading: false,
  }
}
