'use client'

import { useMemo, useState } from 'react'
import {
  Wallet,
  Clock,
  Undo2,
  Banknote,
  Smartphone,
  Landmark,
  LockOpen,
  Lock,
  Plus,
  Trash2,
  TrendingDown,
} from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useReservas } from '@/hooks/reservas/useReservas'
import {
  useCajaActual,
  useEgresos,
  useEliminarEgreso,
} from '@/hooks/caja/useCaja'
import { AbrirCajaModal } from '@/components/caja/AbrirCajaModal'
import { CerrarCajaModal } from '@/components/caja/CerrarCajaModal'
import { EgresoFormModal } from '@/components/caja/EgresoFormModal'
import { formatCurrency } from '@/lib/utils'
import type { EgresoCaja, MetodoPago, Reserva } from '@/types'

const METODOS: { key: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { key: 'EFECTIVO', label: 'Efectivo', icon: <Banknote size={16} /> },
  { key: 'YAPE', label: 'Yape', icon: <Smartphone size={16} /> },
  { key: 'PLIN', label: 'Plin', icon: <Smartphone size={16} /> },
  { key: 'TRANSFERENCIA', label: 'Transferencia', icon: <Landmark size={16} /> },
]

// Reservas que no generaron ingreso real: no entran al cálculo de caja.
const SIN_INGRESO = ['CANCELADA', 'NO_SHOW']

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

  const [abrirOpen, setAbrirOpen] = useState(false)
  const [cerrarOpen, setCerrarOpen] = useState(false)
  const [egresoOpen, setEgresoOpen] = useState(false)

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

  const { data: cajaSesion, isLoading: loadingCaja } = useCajaActual(
    localId ?? undefined,
  )

  const { data: egresosResp, isLoading: loadingEgresos } = useEgresos(
    localId ?? undefined,
    { desde: desde.toISOString(), hasta: hasta.toISOString() },
  )
  const eliminarEgreso = useEliminarEgreso()

  const reservas = useMemo<Reserva[]>(
    () => reservasResp?.data ?? [],
    [reservasResp],
  )

  const egresos = useMemo<EgresoCaja[]>(
    () => egresosResp ?? [],
    [egresosResp],
  )

  const caja = useMemo(() => {
    const porMetodo = new Map<MetodoPago, { total: number; count: number }>()
    const movimientos: Movimiento[] = []
    let cobrado = 0
    let porCobrar = 0
    let devuelto = 0

    for (const r of reservas) {
      if (SIN_INGRESO.includes(r.estado)) continue
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

  // Totales de egresos (todos y solo efectivo).
  const egresosTotales = useMemo(() => {
    let total = 0
    let efectivo = 0
    for (const e of egresos) {
      const monto = Number(e.monto ?? 0)
      total += monto
      if (e.metodoPago === 'EFECTIVO') efectivo += monto
    }
    return { total, efectivo }
  }, [egresos])

  const cobradoEfectivo = caja.porMetodo.get('EFECTIVO')?.total ?? 0
  const montoInicial = cajaSesion ? Number(cajaSesion.montoInicial) : 0

  const isLoading =
    loadingLocal || loadingReservas || loadingCaja || loadingEgresos
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
            {/* Estado de la caja: abierta / cerrada */}
            <Card className="p-5">
              {cajaSesion ? (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="sm">
                        Caja abierta
                      </Badge>
                      <span className="text-xs text-gray-500">
                        desde las {horaCorta(cajaSesion.abiertaEn)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Monto inicial:{' '}
                      <span className="font-semibold text-dark">
                        {formatCurrency(montoInicial)}
                      </span>
                    </p>
                    {cajaSesion.notaApertura && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {cajaSesion.notaApertura}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    leftIcon={<Lock size={16} />}
                    onClick={() => setCerrarOpen(true)}
                  >
                    Cerrar caja
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        Caja cerrada
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      No hay una caja abierta para este local. Ábrela para
                      empezar el arqueo del turno.
                    </p>
                  </div>
                  <Button
                    leftIcon={<LockOpen size={16} />}
                    onClick={() => setAbrirOpen(true)}
                  >
                    Abrir caja
                  </Button>
                </div>
              )}
            </Card>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
              <MetricCard
                title="Egresos"
                value={formatCurrency(egresosTotales.total)}
                subtitle="gastos del día"
                icon={<TrendingDown size={18} />}
                color="warning"
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

            {/* Egresos del día */}
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-dark">
                  Egresos {esHoy ? 'de hoy' : `del ${fecha}`}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setEgresoOpen(true)}
                >
                  Registrar egreso
                </Button>
              </div>
              {egresos.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">
                  No hay egresos {esHoy ? 'hoy' : 'este día'}.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-3 font-semibold">Hora</th>
                        <th className="py-2 pr-3 font-semibold">Concepto</th>
                        <th className="py-2 pr-3 font-semibold">Método</th>
                        <th className="py-2 pl-3 text-right font-semibold">
                          Monto
                        </th>
                        <th className="py-2 pl-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {egresos.map((e) => (
                        <tr
                          key={e.id}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="py-2 pr-3 font-medium text-gray-700">
                            {horaCorta(e.fecha)}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">
                            {e.concepto}
                          </td>
                          <td className="py-2 pr-3">
                            <Badge variant="neutral" size="sm">
                              {METODOS.find((m) => m.key === e.metodoPago)
                                ?.label ?? e.metodoPago}
                            </Badge>
                          </td>
                          <td className="py-2 pl-3 text-right font-semibold text-red-600">
                            {formatCurrency(Number(e.monto))}
                          </td>
                          <td className="py-2 pl-3 text-right">
                            <button
                              type="button"
                              aria-label="Eliminar egreso"
                              disabled={eliminarEgreso.isPending}
                              onClick={() => eliminarEgreso.mutate(e.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
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
                          Total egresos
                        </td>
                        <td className="py-2 pl-3 text-right text-base font-bold text-red-600">
                          {formatCurrency(egresosTotales.total)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
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

      {localId && (
        <>
          <AbrirCajaModal
            isOpen={abrirOpen}
            onClose={() => setAbrirOpen(false)}
            localId={localId}
          />
          <EgresoFormModal
            isOpen={egresoOpen}
            onClose={() => setEgresoOpen(false)}
            localId={localId}
            cajaSesionId={cajaSesion?.id}
          />
          {cajaSesion && (
            <CerrarCajaModal
              isOpen={cerrarOpen}
              onClose={() => setCerrarOpen(false)}
              sesionId={cajaSesion.id}
              montoInicial={montoInicial}
              cobradoEfectivo={cobradoEfectivo}
              egresosEfectivo={egresosTotales.efectivo}
            />
          )}
        </>
      )}
    </>
  )
}
