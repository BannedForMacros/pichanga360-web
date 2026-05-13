'use client'

import { type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-dark/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className={cn(
            // El modal nunca supera el 90% del viewport. El contenido se
            // distribuye en flex-col: header + body scrolleable + footer
            // pegados, para que ningún contenido alto quede oculto.
            'fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-2xl focus:outline-none',
            sizes[size],
          )}
        >
          {(title || description) && (
            <div className="shrink-0 border-b border-gray-100 px-6 pb-4 pr-12 pt-6">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-dark">
                  {title}
                </Dialog.Title>
              )}
              {description && (
                <Dialog.Description className="mt-1 text-sm text-gray-600">
                  {description}
                </Dialog.Description>
              )}
            </div>
          )}

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 z-10 rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </Dialog.Close>

          {/* Body scrolleable: ocupa el alto disponible entre header y footer */}
          <div
            className={cn(
              'flex-1 overflow-y-auto overscroll-contain px-6 py-6',
              // Si no hay header arriba, el padding superior ya lo da py-6
              !(title || description) && 'pt-12',
            )}
          >
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t border-gray-100 px-6 py-4">
              <div className="flex items-center justify-end gap-2">
                {footer}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
