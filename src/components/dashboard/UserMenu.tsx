'use client'

import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { LogOut, User as UserIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { useLogout, useUsuarioActual } from '@/hooks/auth/useAuth'
import type { TipoRol } from '@/types'

const ROL_LABEL: Record<TipoRol, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN_EMPRESA: 'Administrador de empresa',
  ADMIN_LOCAL: 'Administrador de local',
  OPERADOR: 'Operador',
  CLIENTE: 'Cliente',
}

export function UserMenu() {
  const { data: me } = useUsuarioActual()
  const logout = useLogout()

  if (!me?.user) return null

  const nombre = `${me.user.nombre} ${me.user.apellido ?? ''}`.trim()
  const rolPrincipal = me.roles?.[0]?.rol as TipoRol | undefined

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menú de usuario"
          className="rounded-full transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Avatar
            name={nombre}
            src={me.user.avatarUrl ?? undefined}
            size="sm"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[240px] rounded-2xl border border-gray-200 bg-white p-1 shadow-xl"
        >
          <div className="px-3 py-3">
            <p className="truncate text-sm font-semibold text-dark">{nombre}</p>
            <p className="truncate text-xs text-gray-500">{me.user.email}</p>
            {rolPrincipal && (
              <p className="mt-1 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {ROL_LABEL[rolPrincipal] ?? rolPrincipal}
              </p>
            )}
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
          <DropdownMenu.Item asChild>
            <Link
              href="/perfil"
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:bg-primary-50 focus:text-primary"
            >
              <UserIcon size={14} /> Mi perfil
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link
              href="/configuracion"
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:bg-primary-50 focus:text-primary"
            >
              <Settings size={14} /> Configuración
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
          <DropdownMenu.Item
            onSelect={(e) => {
              e.preventDefault()
              logout()
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 outline-none focus:bg-red-50"
          >
            <LogOut size={14} /> Cerrar sesión
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
