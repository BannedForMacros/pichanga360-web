'use client'

import { Bell, Plus, ChevronRight, Menu } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useUsuarioActual } from '@/hooks/auth/useAuth'

interface HeaderProps {
  title: string
  breadcrumb?: { label: string; href?: string }[]
  range?: string
  onNew?: () => void
  newLabel?: string
  onOpenMenu?: () => void
}

export function Header({
  title,
  breadcrumb = [],
  range,
  onNew,
  newLabel = '+ Nuevo',
  onOpenMenu,
}: HeaderProps) {
  const { data: me } = useUsuarioActual()
  const nombreCompleto = me?.user
    ? `${me.user.nombre} ${me.user.apellido ?? ''}`.trim()
    : ''

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="min-w-0">
          {breadcrumb.length > 0 && (
            <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
              {breadcrumb.map((b, i) => (
                <span key={`${b.label}-${i}`} className="flex items-center gap-1">
                  <span className="truncate">{b.label}</span>
                  {i < breadcrumb.length - 1 && <ChevronRight size={12} />}
                </span>
              ))}
            </nav>
          )}
          <h1 className="truncate text-xl font-bold tracking-tight text-dark sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {range && (
          <span className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 md:inline-flex">
            {range}
          </span>
        )}
        {onNew && (
          <Button variant="success" leftIcon={<Plus size={16} />} onClick={onNew} size="sm">
            {newLabel.replace('+ ', '')}
          </Button>
        )}
        <button
          aria-label="Notificaciones"
          className="relative rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:border-primary hover:text-primary"
        >
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-warning" />
        </button>
        {nombreCompleto && (
          <Avatar
            name={nombreCompleto}
            src={me?.user?.avatarUrl ?? undefined}
            size="sm"
          />
        )}
      </div>
    </header>
  )
}
