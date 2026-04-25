'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface NavbarProps {
  variant?: 'default' | 'compact'
}

export function Navbar({ variant = 'default' }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-2 ring-primary">
            <span className="text-lg font-black text-primary">P</span>
          </span>
          <span className="text-lg font-extrabold tracking-tight text-primary">
            Pichanga<span className="text-warning">360</span>
          </span>
        </Link>

        {variant === 'default' ? (
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/buscar"
              className="text-sm font-medium text-dark/80 hover:text-primary"
            >
              Centro
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm font-medium text-dark/80 hover:text-primary"
            >
              Cómo funciona
            </Link>
            <Link
              href="#precios"
              className="text-sm font-medium text-dark/80 hover:text-primary"
            >
              Precios
            </Link>
          </nav>
        ) : (
          <div className="hidden flex-1 items-center justify-center px-6 md:flex">
            <div className="flex h-10 w-full max-w-md items-center justify-between gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm">
              <span className="truncate text-gray-600">
                Lima · Fútbol · Hoy
              </span>
              <button className="text-xs font-semibold text-primary hover:text-primary-700">
                Editar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/registro" className="hidden sm:block">
            <Button variant="primary" size="sm">
              Registrar mi cancha
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
