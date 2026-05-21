/*
 * Service Worker de Pichanga360.
 *
 * Alcance MVP:
 *  - Habilita Web Push (event 'push' → showNotification).
 *  - Manejo de click en la notificación: abre/enfoca la URL del payload.
 *  - Fetch handler trivial (pass-through). Sin caché por ahora — eso vendrá
 *    en una iteración posterior cuando se decida la estrategia offline. El
 *    handler existe porque Chrome necesita ver un addEventListener('fetch')
 *    para marcar la app como instalable.
 *
 * Versionado: bump CACHE_VERSION cuando cambies este archivo. Como no hay
 * caché propia, basta para forzar update del SW (Cache-Control no-cache
 * está configurado en next.config.ts).
 */

const CACHE_VERSION = 'v1';

self.addEventListener('install', (event) => {
  // Activar este SW inmediatamente sin esperar a que se cierren las pestañas.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Tomar control de las pestañas abiertas que ya tenían un SW previo.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // No-op por diseño. Ver comentario superior.
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try {
    data = event.data.json();
  } catch {
    // Si llega algo no-JSON, lo mostramos como body simple.
    data = { title: 'Pichanga360', body: event.data.text() };
  }
  const title = data.title || 'Pichanga360';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon.svg',
    badge: data.badge || '/icons/icon.svg',
    tag: data.tag,
    data: { url: data.url || '/' },
    // vibrate funciona en Android; Windows lo ignora.
    vibrate: [80, 40, 80],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        // Si ya hay una ventana abierta, enfocarla y navegar.
        for (const client of clientsArr) {
          if ('focus' in client) {
            try {
              client.navigate(targetUrl);
            } catch {
              /* navegación no soportada en algunos browsers; al menos enfocamos */
            }
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});

// Marcador para inspección rápida desde DevTools.
self.__PICHANGA_SW__ = CACHE_VERSION;
