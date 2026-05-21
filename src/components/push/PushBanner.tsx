'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePush } from '@/hooks/push/usePush'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'pichanga.push-banner.dismissed-at'
// Si el dueño descarta el banner, no lo molestamos por 7 días.
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Banner sutil arriba del dashboard que invita al dueño/operador a activar
 * notificaciones. Solo aparece si:
 *  - el navegador las soporta,
 *  - todavía no las activó,
 *  - no las denegó,
 *  - no lo descartó hace menos de 7 días,
 *  - el usuario tiene rol operador/admin (los clientes puros no lo ven).
 */
export function PushBanner() {
  const { data: me } = useUsuarioActual()
  const { estado, working, activar } = usePush()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const raw = typeof window === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const ts = parseInt(raw, 10)
    if (!Number.isFinite(ts)) return
    if (Date.now() - ts < DISMISS_MS) setDismissed(true)
  }, [])

  const esOperador =
    !!me?.roles?.some((r) =>
      ['SUPER_ADMIN', 'ADMIN_EMPRESA', 'ADMIN_LOCAL', 'OPERADOR'].includes(
        r.rol,
      ),
    )

  if (!esOperador) return null
  if (dismissed) return null
  if (estado === 'desconocido' || estado === 'activo') return null

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
    setDismissed(true)
  }

  if (estado === 'no-soportado') return null

  if (estado === 'denegado') {
    return (
      <Banner
        tono="warn"
        icono={<BellOff size={16} />}
        titulo="Notificaciones bloqueadas"
        mensaje="Tu navegador está bloqueando las notificaciones de Pichanga360. Cambia el permiso desde el candado de la barra de direcciones para que te avisemos de nuevas reservas."
        onDismiss={dismiss}
      />
    )
  }

  return (
    <Banner
      tono="info"
      icono={<Bell size={16} />}
      titulo="Activa las notificaciones"
      mensaje="Recibe un aviso cuando un cliente reserve o cancele en tu local, aunque tengas Pichanga360 cerrado."
      onDismiss={dismiss}
      cta={
        <Button size="sm" variant="primary" loading={working} onClick={activar}>
          Activar
        </Button>
      }
    />
  )
}

function Banner({
  tono,
  icono,
  titulo,
  mensaje,
  cta,
  onDismiss,
}: {
  tono: 'info' | 'warn'
  icono: React.ReactNode
  titulo: string
  mensaje: string
  cta?: React.ReactNode
  onDismiss: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 border-b px-4 py-3 text-sm sm:px-6',
        tono === 'info'
          ? 'border-primary-100 bg-primary-50 text-primary-800'
          : 'border-warning/40 bg-warning/10 text-warning-700',
      )}
    >
      <span className="mt-0.5 shrink-0">{icono}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{titulo}</p>
        <p className="text-xs opacity-90">{mensaje}</p>
      </div>
      {cta}
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 rounded p-1 opacity-60 hover:opacity-100"
        aria-label="Descartar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
