'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface MenuContextValue {
  open: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function useDashboardMenu() {
  const ctx = useContext(MenuContext)
  return ctx ?? { open: () => {} }
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <MenuContext.Provider value={{ open: () => setIsOpen(true) }}>
      <div className="flex min-h-screen bg-background">
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </MenuContext.Provider>
  )
}
