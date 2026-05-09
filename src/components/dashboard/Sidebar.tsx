'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  ChevronDown,
  Check,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import { useModulosDisponibles } from '@/hooks/modulos/useModulosDisponibles'
import { useLocalActualContext } from '@/contexts/LocalActualContext'
import { moduloIcon } from './moduloIcon'
import { resolveRuta } from './rutaResolver'
import type { ModuloNodo } from '@/types'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

function isActive(pathname: string, ruta: string | null) {
  if (!ruta) return false
  if (ruta === '/') return pathname === '/'
  return pathname === ruta || pathname.startsWith(ruta + '/')
}

function ItemLink({
  modulo,
  pathname,
  onNavigate,
}: {
  modulo: ModuloNodo
  pathname: string
  onNavigate?: () => void
}) {
  const ruta = resolveRuta(modulo.ruta)
  const active = isActive(pathname, ruta)
  const icon = moduloIcon(modulo.icono, 18)

  if (!ruta) {
    // Hoja sin ruta — solo etiqueta
    return (
      <span className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-500">
        {icon}
        {modulo.nombre}
      </span>
    )
  }

  return (
    <Link
      href={ruta}
      onClick={onNavigate}
      className={cn(
        'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-gray-700 hover:bg-primary-50 hover:text-primary',
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {modulo.nombre}
      </span>
    </Link>
  )
}

function ParentSection({
  modulo,
  pathname,
  onNavigate,
}: {
  modulo: ModuloNodo
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {modulo.nombre}
      </p>
      <ul className="space-y-0.5">
        {modulo.hijos.map((h) => (
          <li key={h.id}>
            <ItemLink modulo={h} pathname={pathname} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function LocalSelector() {
  const { local, locales, setLocalId, isLoading } = useLocalActualContext()
  const [open, setOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <Spinner size="sm" /> Cargando local…
        </span>
      </div>
    )
  }

  if (!local) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          Local
        </span>
        <span className="block">Sin local asignado</span>
      </div>
    )
  }

  // Si solo hay un local lo mostramos sin dropdown (no hay nada que elegir)
  if (locales.length <= 1) {
    return (
      <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Local
          </span>
          <span className="block truncate font-semibold text-dark">
            {local.nombre}
          </span>
        </span>
      </div>
    )
  }

  return (
    <div className="relative mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm hover:border-primary"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Local
          </span>
          <span className="block truncate font-semibold text-dark">
            {local.nombre}
          </span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
          {locales.map((l) => {
            const selected = l.id === local.id
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLocalId(l.id)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition',
                  selected
                    ? 'bg-primary-50 text-primary'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{l.nombre}</span>
                  <span className="block truncate text-[11px] text-gray-500">
                    {l.distrito} · {l.provincia}
                  </span>
                </span>
                {selected && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: modulos, isLoading: loadingModulos } = useModulosDisponibles('WEB')

  const dashboardActive = pathname === '/dashboard'

  const content = (
    <>
      <div className="flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2 py-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <span className="text-base font-black">P</span>
          </span>
          <span className="text-base font-extrabold tracking-tight text-primary">
            Pichanga<span className="text-warning">360</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <LocalSelector />

      <nav className="mt-2 flex-1 overflow-y-auto pr-1">
        {/* Dashboard es la home del backoffice — no es un módulo de dominio */}
        <div className="mt-5 first:mt-0">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            General
          </p>
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/dashboard"
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
                  dashboardActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary',
                )}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard size={18} /> Dashboard
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {loadingModulos ? (
          <div className="mt-5 flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
            <Spinner size="sm" /> Cargando módulos…
          </div>
        ) : modulos && modulos.length > 0 ? (
          modulos.map((m) =>
            m.hijos.length > 0 ? (
              <ParentSection
                key={m.id}
                modulo={m}
                pathname={pathname}
                onNavigate={onClose}
              />
            ) : (
              <div className="mt-5 first:mt-0" key={m.id}>
                <ul className="space-y-0.5">
                  <li>
                    <ItemLink
                      modulo={m}
                      pathname={pathname}
                      onNavigate={onClose}
                    />
                  </li>
                </ul>
              </div>
            ),
          )
        ) : (
          <div className="mt-5 px-3 py-2 text-xs text-gray-500">
            Tu rol no tiene módulos asignados.
          </div>
        )}
      </nav>

      <div className="mt-4 space-y-2">
        <Link
          href="#"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary"
        >
          <Settings size={18} /> Configuración
        </Link>
        <Link
          href="#"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary"
        >
          <LifeBuoy size={18} /> Soporte
        </Link>

        <div className="rounded-2xl bg-primary-700 p-4 text-white">
          <Badge variant="warning" size="sm">
            PLAN
          </Badge>
          <p className="mt-2 text-sm font-semibold">Mejora tu plan</p>
          <p className="mt-1 text-xs text-white/70">
            Más locales, canchas y reservas concurrentes.
          </p>
          <Link href="/suscripciones">
            <Button variant="warning" size="sm" fullWidth className="mt-3">
              Ver planes
            </Button>
          </Link>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4 lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-dark/50 backdrop-blur-sm transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-gray-200 bg-white p-4 shadow-2xl transition-transform lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!isOpen}
      >
        {content}
      </aside>
    </>
  )
}
