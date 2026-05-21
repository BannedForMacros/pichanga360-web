'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const STORAGE_KEY = 'pichanga.install-banner.dismissed-at'
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000 // 14 días

/** Tipo no estándar — `beforeinstallprompt` solo existe en Chromium. */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Banner para invitar a instalar la PWA.
 *  - Android/Chrome/Edge: usa `beforeinstallprompt` para mostrar el modal nativo.
 *  - iOS Safari: muestra instrucciones (no hay API, hay que hacerlo a mano).
 *  - Si ya está instalada (display-mode: standalone), no aparece.
 *  - Dismissable; se oculta 14 días.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !('MSStream' in window),
    )
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const ts = parseInt(raw, 10)
      if (Number.isFinite(ts) && Date.now() - ts < DISMISS_MS) {
        setDismissed(true)
      }
    }
    const onBefore = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBefore)
    const onInstalled = () => setDeferred(null)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (isStandalone || dismissed) return null
  // En navegadores no-Chromium y no-iOS, no hay forma estándar de invitar.
  if (!deferred && !isIOS) return null

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setDismissed(true)
  }

  const installAndroid = async () => {
    if (!deferred) return
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') {
      setDeferred(null)
    } else {
      dismiss()
    }
  }

  return (
    <div className="flex items-start gap-3 border-b border-success/30 bg-success/5 px-4 py-3 text-sm text-success-700 sm:px-6">
      <Download size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Instala Pichanga360 en tu dispositivo</p>
        {isIOS ? (
          <p className="text-xs opacity-90">
            Toca <Share size={11} className="inline align-text-bottom" /> y
            elige <strong>Agregar a pantalla de inicio</strong> para acceder
            como una app.
          </p>
        ) : (
          <p className="text-xs opacity-90">
            Tenla en tu pantalla de inicio para abrirla más rápido y recibir
            notificaciones con la app cerrada.
          </p>
        )}
      </div>
      {!isIOS && deferred && (
        <Button size="sm" variant="success" onClick={installAndroid}>
          Instalar
        </Button>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="ml-1 rounded p-1 opacity-60 hover:opacity-100"
        aria-label="Descartar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
