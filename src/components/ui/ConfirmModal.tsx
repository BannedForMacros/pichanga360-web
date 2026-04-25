'use client'

import { AlertTriangle, Info, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

type Variant = 'danger' | 'warning' | 'info'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const palette: Record<
  Variant,
  { icon: React.ReactNode; iconBg: string; button: 'danger' | 'warning' | 'primary' }
> = {
  danger: {
    icon: <Trash2 size={22} />,
    iconBg: 'bg-red-100 text-red-600',
    button: 'danger',
  },
  warning: {
    icon: <AlertTriangle size={22} />,
    iconBg: 'bg-warning-50 text-warning-600',
    button: 'warning',
  },
  info: {
    icon: <Info size={22} />,
    iconBg: 'bg-primary-50 text-primary',
    button: 'primary',
  },
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { icon, iconBg, button } = palette[variant]

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-dark">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={button} loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
