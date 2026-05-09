/**
 * El sidebar se pinta desde el backend (módulos en BD), pero algunas rutas
 * canónicas del seed no coinciden con la convención de carpetas del frontend.
 * Aquí mapeamos esos alias para que los links del sidebar abran la página real.
 *
 * Cuando una ruta no tiene alias, la dejamos pasar tal cual (Next.js mostrará
 * 404 si la página todavía no existe — lo cual es esperado en el esqueleto).
 */
const ALIAS: Record<string, string> = {
  '/productos': '/bebidas',
  '/usuarios': '/clientes',
}

export function resolveRuta(ruta: string | null | undefined): string | null {
  if (!ruta) return null
  return ALIAS[ruta] ?? ruta
}
