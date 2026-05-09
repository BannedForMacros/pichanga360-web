'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Goal,
  Clock,
  CupSoda,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronDown,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const principal: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Mis Canchas', href: '/canchas', icon: <Goal size={18} />, badge: '4' },
  { label: 'Reservas', href: '/reservas', icon: <CalendarDays size={18} />, badge: '12' },
  { label: 'Horarios', href: '/horarios', icon: <Clock size={18} /> },
]

const operacion: NavItem[] = [
  { label: 'Bebidas / Snacks', href: '/bebidas', icon: <CupSoda size={18} /> },
  { label: 'Clientes', href: '/clientes', icon: <Users size={18} /> },
  { label: 'Reportes', href: '/reportes', icon: <BarChart3 size={18} /> },
]

function Section({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-primary-50 hover:text-primary'
                )}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge && (
                  <Badge
                    variant={active ? 'warning' : 'primary'}
                    size="sm"
                    className={cn(active && 'bg-warning text-white')}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

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

      <button className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm hover:border-primary">
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Local
          </span>
          <span className="block truncate font-semibold text-dark">
            Sport Center San Isidro
          </span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-gray-400" />
      </button>

      <nav className="mt-2 flex-1 overflow-y-auto pr-1">
        <Section
          title="Principal"
          items={principal}
          pathname={pathname}
          onNavigate={onClose}
        />
        <Section
          title="Operación"
          items={operacion}
          pathname={pathname}
          onNavigate={onClose}
        />
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
          <Badge variant="warning" size="sm">PREMIUM</Badge>
          <p className="mt-2 text-sm font-semibold">Plan Premium</p>
          <p className="mt-1 text-xs text-white/70">
            Métricas en vivo y reservas ilimitadas.
          </p>
          <Button variant="warning" size="sm" fullWidth className="mt-3">
            Mejorar plan
          </Button>
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
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-gray-200 bg-white p-4 shadow-2xl transition-transform lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isOpen}
      >
        {content}
      </aside>
    </>
  )
}
