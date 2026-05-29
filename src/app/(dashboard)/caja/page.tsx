'use client'

import { useMemo, useState } from 'react'
import { Wallet, Clock, Undo2, Banknote, Smartphone, Landmark } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useReservas } from '@/hooks/reservas/useReservas'
import { formatCurrency } from '@/lib/utils'
import type { MetodoPago, Reserva } from '@/types'

const METODOS: { key: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { key: 'EFECTIVO', label: 'Efectivo', icon: <Banknote size={16} /> },
  { key: 'YAPE', label: 'Yape', icon: <Smartphone size={16} /> },
  { key: 'PLIN', label: 'Plin', icon: <Smartphone size={16} /> },
  { key: 'TRANSFERENCIA', label: 'Transferencia', icon: <Landmark size={16} /> },
]

function horaCorta(iso: string) {
  return new Date(iso).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

interface Movimiento {
  reservaId: string
  cliente: string
  hora: string
  metodo: MetodoPago
  monto: number
}

export default function CajaPage() {
  const { open } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))

  // Rango [00:00, 24:00) del día seleccionado, en hora local del navegador.
  const desde = useMemo(() => new Date(`${fecha}T00:00:00`), [fecha])
  const hasta = useMemo(() => {
    const d = new Date(`${fecha}T00:00:00`)
    d.setDate(d.getDate() + 1)
    return d
  }, [fecha])

  const { data: reservasResp, isLoading: loadingReservas } = useReservas({
    localId: localId ?? undefined,
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
    limit: 200,
  })

  const reservas = useMemo<Reserva[]>(
    () => reservasResp?.data ?? [],
    [reservasResp],
  )

  const caja = useMemo(() => {
    const porMetodo = new Map<MetodoPago, { total: number; count: number }>()
    const movimientos: Movimiento[] = []
    let cobrado = 0
    let porCobrar = 0
    let devuelto = 0

    for (const r of reservas) {
      if (r.estado === 'CANCELADA') continue
      const cliente = r.cliente
        ? `${r.cliente.nombre ?? ''} ${r.cliente.apellido ?? ''}`.trim() ||
          'Cliente'
        : 'Cliente'
      for (const p of r.pagos ?? []) {
        const monto = Number(p.monto ?? 0)
        if (p.estado === 'PAGADO') {
          cobrado += monto
          const acc = porMetodo.get(p.metodoPago) ?? { total: 0, count: 0 }
          acc.total += monto
          acc.count += 1
          porMetodo.set(p.metodoPago, acc)
          movimientos.push({
            reservaId: r.id,
            cliente,
            hora: horaCorta(r.fechaInicio),
            metodo: p.metodoPago,
            monto,
          })
        } else if (p.estado === 'PENDIENTE') {
          porCobrar += monto
        } else if (p.estado === 'DEVUELTO') {
          devuelto += monto
        }
      }
    }

    movimientos.sort((a, b) => (a.hora < b.hora ? -1 : 1))
    return { porMetodo, movimientos, cobrado, porCobrar, devuelto }
  }, [reservas])

  const isLoading = loadingLocal || loadingReservas
  const esHoy = fecha === new Date().toISOString().slice(0, 10)

  return (
    <>
      <Header
        title="Caja"
        breadcrumb={[{ label: 'Operación' }, { label: 'Caja del día' }]}
        onOpenMenu={open}
      />
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Movimientos de las reservas {esHoy ? 'de hoy' : `del ${fecha}`}.
          </p>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 focus:border-primary focus:outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !localId ? (
          <Card>
            <p className="text-base font-semibold text-dark">
              Aún no tienes un local registrado
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Crea un local para empezar a ver la caja diaria.
            </p>
          </Card>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <MetricCard
                title="Cobrado"
                value={formatCurrency(caja.cobrado)}
                subtitle="pagos confirmados"
                icon={<Wallet size={18} />}
                color="success"
              />
              <MetricCard
                title="Por cobrar"
                value={formatCurrency(caja.porCobrar)}
                subtitle="pagos pendientes"
                icon={<Clock size={18} />}
                color="warning"
              />
              <MetricCard
                title="Devuelto"
                value={formatCurrency(caja.devuelto)}
                subtitle="reembolsos del día"
                icon={<Undo2 size={18} />}
                color="primary"
              />
            </section>

            <Card className="p-5">
              <h2 className="text-base font-semibold text-dark">
                Cobrado por método
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {METODOS.map((m) => {
                  const d = caja.porMetodo.get(m.key)
                  return (
                    <div
                      key={m.key}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {m.icon}
                        {m.label}
                      </span>
                      <p className="mt-1 text-lg font-bold text-dark">
                        {formatCurrency(d?.total ?? 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {d?.count ?? 0} pago{(d?.count ?? 0) === 1 ? '' : 's'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-base font-semibold text-dark">
                Detalle de cobros
              </h2>
              {caja.movimientos.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">
                  No hay cobros confirmados {esHoy ? 'hoy' : 'este día'}.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-3 font-semibold">Hora</th>
                        <th className="py-2 pr-3 font-semibold">Cliente</th>
                        <th className="py-2 pr-3 font-semibold">Método</th>
                        <th className="py-2 pl-3 text-right font-semibold">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {caja.movimientos.map((mov, i) => (
                        <tr
                          key={`${mov.reservaId}-${i}`}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-2 pr-3 font-medium text-gray-700">
                            {mov.hora}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">
                            {mov.cliente}
                          </td>
                          <td className="py-2 pr-3">
                            <Badge variant="neutral" size="sm">
                              {METODOS.find((m) => m.key === mov.metodo)?.label ??
                                mov.metodo}
                            </Badge>
                          </td>
                          <td className="py-2 pl-3 text-right font-semibold text-dark">
                            {formatCurrency(mov.monto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td
                          colSpan={3}
                          className="py-2 pr-3 text-right text-sm font-semibold text-gray-600"
                        >
                          Total cobrado
                        </td>
                        <td className="py-2 pl-3 text-right text-base font-bold text-success">
                          {formatCurrency(caja.cobrado)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  )
}
