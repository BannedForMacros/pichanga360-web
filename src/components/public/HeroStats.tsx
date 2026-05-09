'use client'

import { useMemo } from 'react'
import { useLocales } from '@/hooks/locales/useLocales'
import { useDeportes } from '@/hooks/catalogos/useDeportes'

/**
 * Tres stats en vivo para el hero del landing:
 *   - canchas activas (suma de _count.canchas de cada local)
 *   - deportes disponibles (catálogo)
 *   - distritos cubiertos (únicos a partir de los locales devueltos)
 */
export function HeroStats() {
  const { data: localesResp } = useLocales({ limit: 100 })
  const { data: deportes } = useDeportes()

  const stats = useMemo(() => {
    const locales = localesResp?.data ?? []
    let canchas = 0
    const distritos = new Set<string>()
    for (const l of locales) {
      // _count.canchas viene del backend pero no está en el tipo Local del frontend
      const c = (l as unknown as { _count?: { canchas?: number } })._count
      if (c?.canchas) canchas += c.canchas
      else if (Array.isArray(l.canchas)) canchas += l.canchas.length
      if (l.distrito) distritos.add(l.distrito)
    }
    const totalLocales = localesResp?.meta?.total ?? locales.length
    return {
      canchas,
      deportes: deportes?.length ?? 0,
      distritos: distritos.size,
      locales: totalLocales,
    }
  }, [localesResp, deportes])

  return (
    <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6 text-center">
      <Stat value={fmt(stats.canchas)} label="Canchas activas" />
      <Stat value={String(stats.deportes)} label="Deportes" />
      <Stat value={String(stats.distritos)} label="Distritos" />
    </div>
  )
}

export function HeroBadgeCount() {
  const { data: localesResp } = useLocales({ limit: 1 })
  const total = localesResp?.meta?.total ?? 0
  if (total === 0) return <>Reserva tu cancha en segundos</>
  return <>⚡ {fmt(total)} locales registrados en Perú</>
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-warning md:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
        {label}
      </p>
    </div>
  )
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K+`
  return String(n)
}
