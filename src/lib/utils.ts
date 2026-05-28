import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-PE', opts ?? { dateStyle: 'medium' }).format(d)
}

/**
 * Construye un enlace wa.me listo para abrir un chat de WhatsApp con un mensaje
 * pre-cargado. Limpia el número (solo dígitos, wa.me usa E.164 sin '+') y, si
 * viene un número nacional peruano de 9 dígitos sin código de país, le antepone
 * 51. Devuelve null si no hay número usable.
 */
export function buildWhatsAppLink(
  telefono: string | null | undefined,
  mensaje?: string,
): string | null {
  if (!telefono) return null
  let digits = telefono.replace(/\D/g, '')
  if (!digits) return null
  // Celular peruano: 9 dígitos que empiezan en 9 → anteponer código país 51.
  if (digits.length === 9 && digits.startsWith('9')) digits = `51${digits}`
  const text = mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''
  return `https://wa.me/${digits}${text}`
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
}
