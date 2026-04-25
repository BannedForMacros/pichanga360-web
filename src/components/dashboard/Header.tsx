'use client'

import { Bell, Plus, ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  title: string
  breadcrumb?: { label: string; href?: string }[]
  range?: string
  onNew?: () => void
  newLabel?: string
}

export function Header({
  title,
  breadcrumb = [],
  range = 'Esta semana',
  onNew,
  newLabel = '+ Nueva reserva',
}: HeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-gray-200 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {breadcrumb.length > 0 && (
          <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
            {breadcrumb.map((b, i) => (
              <span key={`${b.label}-${i}`} className="flex items-center gap-1">
                {b.label}
                {i < breadcrumb.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-dark">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-primary">
          {range}
        </button>
        {onNew && (
          <Button variant="success" leftIcon={<Plus size={16} />} onClick={onNew}>
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
        <Avatar name="Roberto Cárdenas" />
      </div>
    </header>
  )
}
