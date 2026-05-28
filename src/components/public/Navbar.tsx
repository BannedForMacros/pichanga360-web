'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Container from '@/components/ui/Container'

interface NavbarProps {
  variant?: 'default' | 'compact'
}

const links = [
  { href: '/buscar', label: 'Centro' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#precios', label: 'Precios' },
]

export function Navbar({ variant = 'default' }: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white shadow-sm">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-2 ring-primary">
            <span className="text-lg font-black text-primary">P</span>
          </span>
          <span className="text-base font-extrabold tracking-tight text-primary sm:text-lg">
            Pichanga<span className="text-warning">360</span>
          </span>
        </Link>

        {variant === 'default' ? (
          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-dark/80 hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="hidden flex-1 items-center justify-center px-6 md:flex">
            <div className="flex h-10 w-full max-w-md items-center justify-between gap-3 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm">
              <span className="truncate text-gray-600">Lima · Fútbol · Hoy</span>
              <button className="text-xs font-semibold text-primary hover:text-primary-700">
                Editar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/registro-empresa" className="hidden md:block">
            <Button variant="primary" size="sm">
              Registrar mi cancha
            </Button>
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <Container className="py-4">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-dark/80 hover:bg-primary-50 hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" fullWidth>
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/registro-empresa" onClick={() => setOpen(false)}>
                <Button variant="primary" size="sm" fullWidth>
                  Registrar mi cancha
                </Button>
              </Link>
            </div>
          </nav>
          </Container>
        </div>
      )}
    </header>
  )
}
