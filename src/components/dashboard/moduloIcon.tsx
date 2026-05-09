import {
  Activity,
  Bell,
  Briefcase,
  Building,
  CalendarDays,
  Clock,
  CreditCard,
  Dot,
  DollarSign,
  Goal,
  Hourglass,
  Key,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  MapPin,
  Package,
  Receipt,
  Repeat,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tag,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'

// El backend guarda el icono como string libre (semántico). Aquí lo
// resolvemos a un componente lucide-react. Si no existe match devolvemos
// un punto neutro para que el ítem se siga viendo.
const MAP: Record<string, (size: number) => ReactNode> = {
  briefcase: (s) => <Briefcase size={s} />,
  'map-pin': (s) => <MapPin size={s} />,
  'soccer-field': (s) => <Goal size={s} />,
  'dollar-sign': (s) => <DollarSign size={s} />,
  clock: (s) => <Clock size={s} />,
  calendar: (s) => <CalendarDays size={s} />,
  repeat: (s) => <Repeat size={s} />,
  hourglass: (s) => <Hourglass size={s} />,
  'shopping-cart': (s) => <ShoppingCart size={s} />,
  package: (s) => <Package size={s} />,
  list: (s) => <List size={s} />,
  'cash-register': (s) => <ShoppingBag size={s} />,
  star: (s) => <Star size={s} />,
  building: (s) => <Building size={s} />,
  'credit-card': (s) => <CreditCard size={s} />,
  receipt: (s) => <Receipt size={s} />,
  bell: (s) => <Bell size={s} />,
  settings: (s) => <Settings size={s} />,
  users: (s) => <Users size={s} />,
  shield: (s) => <Shield size={s} />,
  key: (s) => <Key size={s} />,
  layers: (s) => <Layers size={s} />,
  tag: (s) => <Tag size={s} />,
  activity: (s) => <Activity size={s} />,
  grid: (s) => <LayoutGrid size={s} />,
  dashboard: (s) => <LayoutDashboard size={s} />,
}

export function moduloIcon(icono: string | null | undefined, size = 18): ReactNode {
  if (!icono) return <Dot size={size} />
  const factory = MAP[icono.toLowerCase()]
  return factory ? factory(size) : <Dot size={size} />
}
