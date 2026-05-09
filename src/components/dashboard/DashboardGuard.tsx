'use client'

import { useEffect, useMemo, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStore } from '@/lib/api'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import { useLocalActualContext } from '@/contexts/LocalActualContext'
import { useIsMounted } from '@/hooks/useIsMounted'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Protege todas las páginas del grupo (dashboard):
 *  - Si no hay token JWT en localStorage → redirige a /login.
 *  - Si el usuario es ADMIN_EMPRESA y todavía no creó ningún local
 *    → redirige a /onboarding (donde se monta el wizard del primer local).
 *  - SUPER_ADMIN, ADMIN_LOCAL, OPERADOR y CLIENTE pasan sin pasar por
 *    onboarding (su scope ya viene resuelto por backend o no aplica).
 *
 * Mientras se resuelve la decisión muestra un spinner para evitar parpadeos.
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const mounted = useIsMounted()
  const { data: me, isLoading: loadingMe } = useUsuarioActual()
  const { locales, isLoading: loadingLocales } = useLocalActualContext()

  const decision = useMemo<
    'allow' | 'login' | 'onboarding' | 'wait'
  >(() => {
    if (!mounted) return 'wait'
    if (!tokenStore.getAccess()) return 'login'
    if (loadingMe) return 'wait'
    if (!me?.roles?.length) return 'allow' // sin roles aún, no podemos decidir
    const tieneLocalEnRol = me.roles.some((r) => r.localId)
    if (tieneLocalEnRol) return 'allow'
    const esAdminEmpresa = me.roles.some((r) => r.rol === 'ADMIN_EMPRESA')
    if (!esAdminEmpresa) return 'allow'
    if (loadingLocales) return 'wait'
    if (locales.length === 0) return 'onboarding'
    return 'allow'
  }, [mounted, loadingMe, me, loadingLocales, locales])

  useEffect(() => {
    if (decision === 'login') router.replace('/login')
    if (decision === 'onboarding') router.replace('/onboarding')
  }, [decision, router])

  if (decision === 'wait' || decision === 'login' || decision === 'onboarding') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }
  return <>{children}</>
}
