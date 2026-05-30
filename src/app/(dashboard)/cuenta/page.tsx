'use client'

import { Lock, Mail, Phone, ShieldCheck, User as UserIcon } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { CambiarPasswordForm } from '@/components/auth/CambiarPasswordForm'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import type { TipoRol } from '@/types'

const ROL_LABEL: Record<TipoRol, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_EMPRESA: 'Administrador de empresa',
  ADMIN_LOCAL: 'Administrador de local',
  OPERADOR: 'Operador',
  CLIENTE: 'Cliente',
}

export default function MiCuentaPage() {
  const { open } = useDashboardMenu()
  const { data: me, isLoading } = useUsuarioActual()

  const user = me?.user
  const nombre = user ? `${user.nombre} ${user.apellido ?? ''}`.trim() : ''
  const rolPrincipal = me?.roles?.[0]?.rol as TipoRol | undefined

  return (
    <>
      <Header
        title="Mi cuenta"
        breadcrumb={[{ label: 'Cuenta' }, { label: 'Mi cuenta' }]}
        onOpenMenu={open}
      />

      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !user ? (
          <Card>
            <p className="text-base font-semibold text-dark">
              No pudimos cargar tu cuenta
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Vuelve a iniciar sesión e inténtalo de nuevo.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Columna izquierda: cambio de contraseña */}
            <div className="space-y-6">
              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary">
                    <Lock size={14} />
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Cambiar contraseña
                  </h2>
                </div>
                <p className="mb-4 text-xs text-gray-500">
                  Por seguridad, al cambiar tu contraseña se cerrarán todas tus
                  sesiones y deberás iniciar sesión otra vez.
                </p>
                <CambiarPasswordForm />
              </Card>
            </div>

            {/* Columna derecha: datos del usuario (readonly) */}
            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3">
                  <Avatar
                    name={nombre}
                    src={user.avatarUrl ?? undefined}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-dark">
                      {nombre}
                    </p>
                    {rolPrincipal && (
                      <Badge variant="primary">
                        {ROL_LABEL[rolPrincipal] ?? rolPrincipal}
                      </Badge>
                    )}
                  </div>
                </div>

                <ul className="mt-5 space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Email
                      </span>
                      <span className="block truncate text-dark">
                        {user.email}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Teléfono
                      </span>
                      <span className="block truncate text-dark">
                        {user.telefono ?? 'No registrado'}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-gray-400" />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Email verificado
                      </span>
                      <span className="block text-dark">
                        {user.emailVerificado ? 'Sí' : 'No'}
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <UserIcon size={14} className="text-gray-400" />
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Estado
                      </span>
                      <Badge variant={user.activo ? 'success' : 'neutral'}>
                        {user.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
