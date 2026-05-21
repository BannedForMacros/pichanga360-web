/**
 * Helpers para Web Push (suscripción a notificaciones desde el navegador).
 *
 * El backend usa VAPID y guarda la `PushSubscription` completa serializada
 * como JSON en la columna `token` del modelo PushToken — ver
 * `web-push.service.ts`. Por eso aquí mandamos `JSON.stringify(sub)` como
 * `token` al endpoint POST /push-tokens.
 */

import api from '@/lib/api'

/** Convierte la VAPID public key (base64url) al Uint8Array que pide `subscribe`. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Registra el service worker (idempotente) y devuelve la registration.
 * El SW vive en `/sw.js` (public/sw.js).
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register('/sw.js', {
    scope: '/',
    updateViaCache: 'none',
  })
}

/**
 * Suscribe el navegador al servicio push y manda la subscription al backend.
 * Si ya hay una subscription activa, la reutiliza (idempotente).
 */
export async function subscribeAndRegister(): Promise<PushSubscription> {
  const vapidPub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPub) {
    throw new Error(
      'NEXT_PUBLIC_VAPID_PUBLIC_KEY no está definida. Falta configurar VAPID en .env.local.',
    )
  }
  const reg = await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  // El typing actual de PushSubscriptionOptionsInit pide BufferSource sobre
  // ArrayBuffer concreto; el Uint8Array genérico no encaja porque su buffer
  // puede ser SharedArrayBuffer. Pasamos el `.buffer` ya concreto.
  const keyBytes = urlBase64ToUint8Array(vapidPub)
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyBytes.buffer as ArrayBuffer,
    }))

  await api.post('/push-tokens', {
    token: JSON.stringify(sub),
    plataforma: 'WEB',
  })

  return sub
}

/** Quita la subscription del navegador. No borra el token en el backend
 *  (eso requiere conocer el id local — fuera del MVP). */
export async function unsubscribePush(): Promise<boolean> {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.getSubscription()
  if (!sub) return true
  return sub.unsubscribe()
}
