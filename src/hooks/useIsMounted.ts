'use client'

import { useEffect, useState } from 'react'

/**
 * Devuelve `true` solo después del primer render del cliente.
 *
 * Útil cuando un componente depende de algo que solo existe en el navegador
 * (localStorage, window) — el HTML del SSR queda determinista (mounted=false)
 * y el primer render del cliente también arranca con mounted=false, evitando
 * el "hydration mismatch" típico al consultar tokens/queries condicionales.
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
