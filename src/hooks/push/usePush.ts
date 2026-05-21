'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  isPushSupported,
  registerServiceWorker,
  subscribeAndRegister,
  unsubscribePush,
} from '@/lib/push'

export type PushEstado = 'desconocido' | 'no-soportado' | 'sin-permiso' | 'denegado' | 'activo'

/**
 * Maneja todo el ciclo del Web Push del navegador.
 *  - Registra el SW al montar (idempotente).
 *  - Expone el estado actual (soporte + permiso + suscripción).
 *  - Da `activar` / `desactivar` para que el botón los llame.
 */
export function usePush() {
  const [estado, setEstado] = useState<PushEstado>('desconocido')
  const [working, setWorking] = useState(false)

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setEstado('no-soportado')
      return
    }
    if (Notification.permission === 'denied') {
      setEstado('denegado')
      return
    }
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub && Notification.permission === 'granted') {
        setEstado('activo')
      } else {
        setEstado('sin-permiso')
      }
    } catch {
      setEstado('sin-permiso')
    }
  }, [])

  useEffect(() => {
    if (!isPushSupported()) {
      setEstado('no-soportado')
      return
    }
    // Registramos el SW al montar (no pide permiso de notificación).
    registerServiceWorker()
      .then(() => refresh())
      .catch(() => setEstado('sin-permiso'))
  }, [refresh])

  const activar = useCallback(async () => {
    if (working) return
    setWorking(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        setEstado(perm === 'denied' ? 'denegado' : 'sin-permiso')
        if (perm === 'denied') {
          toast.error(
            'Permiso denegado. Habilítalo desde la configuración del navegador.',
            { position: 'top-right' },
          )
        }
        return
      }
      await subscribeAndRegister()
      setEstado('activo')
      toast.success('Notificaciones activadas', { position: 'top-right' })
    } catch (err) {
      console.error(err)
      toast.error('No se pudo activar las notificaciones', {
        position: 'top-right',
      })
    } finally {
      setWorking(false)
    }
  }, [working])

  const desactivar = useCallback(async () => {
    if (working) return
    setWorking(true)
    try {
      await unsubscribePush()
      setEstado('sin-permiso')
      toast.success('Notificaciones desactivadas', { position: 'top-right' })
    } catch (err) {
      console.error(err)
    } finally {
      setWorking(false)
    }
  }, [working])

  return { estado, working, activar, desactivar, refresh }
}
