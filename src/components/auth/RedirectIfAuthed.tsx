'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStore } from '@/lib/api'
import { useIsMounted } from '@/hooks/useIsMounted'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Envuelve páginas públicas de auth (login, registro, registro-empresa).
 * Si el usuario ya tiene un token válido en localStorage, lo manda a
 * /dashboard en lugar de mostrar el formulario.
 *
 * Mientras se resuelve la decisión renderiza un spinner para evitar el
 * "flash" del formulario antes del redirect.
 */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const router = useRouter()
  const mounted = useIsMounted()
  const hasToken = mounted && !!tokenStore.getAccess()

  useEffect(() => {
    if (hasToken) router.replace('/dashboard')
  }, [hasToken, router])

  if (hasToken) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  return <>{children}</>
}
