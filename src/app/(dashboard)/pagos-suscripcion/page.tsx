'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { Spinner } from '@/components/ui/Spinner'
import { PagoSuscripcionForm } from '@/components/suscripciones/PagoSuscripcionForm'
import { useSuscripcionesActuales } from '@/hooks/suscripciones/useSuscripciones'
import { usePagosSuscripcion } from '@/hooks/suscripciones/usePagosSuscripcion'
import { METODO_LABEL } from '@/validators/suscripciones/pago-suscripcion.schema'

const ESTADO_VARIANT: Record<
  'PENDIENTE' | 'PAGADO' | 'RECHAZADO' | 'DEVUELTO',
  'warning' | 'success' | 'danger' | 'neutral'
> = {
  PENDIENTE: 'warning',
  PAGADO: 'success',
  RECHAZADO: 'danger',
  DEVUELTO: 'neutral',
}

function fmtFecha(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(
    new Date(iso),
  )
}

function fmtMonto(m: number | string) {
  return `S/ ${Number(m).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
  })}`
}

export default function PagosSuscripcionPage() {
  const { open } = useDashboardMenu()
  const { data: suscripciones } = useSuscripcionesActuales()
  const [filtroId, setFiltroId] = useState<string | undefined>()
  const { data: pagos, isLoading } = usePagosSuscripcion(filtroId)
  const [modalOpen, setModalOpen] = useState(false)

  const opcionesSuscripcion = useMemo(
    () =>
      (suscripciones ?? []).map((s) => ({
        label: s.plan?.nombre ?? 'Plan',
        value: s.id,
        description: `${fmtFecha(s.fechaInicio)} → ${fmtFecha(s.fechaVencimiento)}`,
      })),
    [suscripciones],
  )

  return (
    <>
      <Header
        title="Pagos de suscripción"
        breadcrumb={[{ label: 'Empresa' }, { label: 'Pagos' }]}
        onNew={() => setModalOpen(true)}
        newLabel="+ Registrar pago"
        onOpenMenu={open}
      />

      <div className="p-4 sm:p-6">
        <Card className="mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-80">
              <SearchableSelect
                label="Filtrar por suscripción"
                options={[
                  { label: 'Todas las suscripciones', value: '' },
                  ...opcionesSuscripcion,
                ]}
                value={filtroId ?? ''}
                onChange={(v) => setFiltroId(v === '' ? undefined : v)}
                placeholder="Todas las suscripciones"
              />
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !pagos || pagos.length === 0 ? (
          <Card>
            <p className="text-base font-semibold text-dark">
              Aún no hay pagos registrados
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Registra tu primer pago con el botón “+ Registrar pago”.
            </p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Periodo</th>
                  <th className="px-5 py-3">Método</th>
                  <th className="px-5 py-3">Monto</th>
                  <th className="px-5 py-3">Referencia</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-gray-700">
                      {fmtFecha(p.fechaPago ?? p.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {fmtFecha(p.periodoInicio)} →{' '}
                      {fmtFecha(p.periodoFin)}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {METODO_LABEL[p.metodoPago] ?? p.metodoPago}
                    </td>
                    <td className="px-5 py-3 font-semibold text-dark">
                      {fmtMonto(p.monto)}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {p.referencia ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={ESTADO_VARIANT[p.estado]}>
                        {p.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar pago de suscripción"
        description="El pago queda en estado PENDIENTE hasta que sea confirmado por administración."
        size="lg"
      >
        <PagoSuscripcionForm
          suscripciones={suscripciones ?? []}
          defaultSuscripcionId={filtroId}
          onSuccess={() => setModalOpen(false)}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </>
  )
}
