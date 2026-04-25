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
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  { label: 'Mis Canchas', href: '/canchas', icon: <Goal size={18} />, badge: '4' },
  {
    label: 'Reservas',
    href: '/reservas',
    icon: <CalendarDays size={18} />,
    badge: '12',
  },
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
}: {
  title: string
  items: NavItem[]
  pathname: string
}) {
  return (
    <div className="mt-6 first:mt-0">
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4 lg:flex">
      <Link href="/" className="flex items-center gap-2 px-2 py-1">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
          <span className="text-base font-black">P</span>
        </span>
        <span className="text-base font-extrabold tracking-tight text-primary">
          Pichanga<span className="text-warning">360</span>
        </span>
      </Link>

      <button className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-sm hover:border-primary">
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Local
          </span>
          <span className="block font-semibold text-dark">Sport Center San Isidro</span>
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      <nav className="mt-2 flex-1 overflow-y-auto">
        <Section title="Principal" items={principal} pathname={pathname} />
        <Section title="Operación" items={operacion} pathname={pathname} />
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
    </aside>
  )
}
