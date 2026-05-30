'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCerrarCaja } from '@/hooks/caja/useCaja'
import { formatCurrency } from '@/lib/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  sesionId: string
  montoInicial: number
  /** Cobrado en EFECTIVO durante el turno (calculado en la página). */
  cobradoEfectivo: number
  /** Egresos en EFECTIVO del turno (calculado en la página). */
  egresosEfectivo: number
}

export function CerrarCajaModal({
  isOpen,
  onClose,
  sesionId,
  montoInicial,
  cobradoEfectivo,
  egresosEfectivo,
}: Props) {
  const [montoContado, setMontoContado] = useState('')
  const [notaCierre, setNotaCierre] = useState('')
  const cerrar = useCerrarCaja()

  const efectivoEsperado = montoInicial + cobradoEfectivo - egresosEfectivo
  const contadoNum = Number(montoContado)
  const valido = montoContado !== '' && !Number.isNaN(contadoNum) && contadoNum >= 0
  const diferencia = valido ? contadoNum - efectivoEsperado : 0

  function cerrarModal() {
    setMontoContado('')
    setNotaCierre('')
    onClose()
  }

  function guardar() {
    if (!valido) return
    cerrar.mutate(
      {
        sesionId,
        montoFinalContado: contadoNum,
        notaCierre: notaCierre.trim() || undefined,
      },
      { onSuccess: cerrarModal },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={cerrarModal}
      title="Cerrar caja (arqueo)"
      description="Cuenta el efectivo físico y compáralo con lo esperado."
      footer={
        <>
          <Button variant="ghost" onClick={cerrarModal} disabled={cerrar.isPending}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={guardar}
            loading={cerrar.isPending}
            disabled={!valido}
          >
            Cerrar caja
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-dark">Efectivo esperado</h3>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Monto inicial</dt>
              <dd className="font-medium text-dark">
                {formatCurrency(montoInicial)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">+ Cobrado en efectivo</dt>
              <dd className="font-medium text-success">
                {formatCurrency(cobradoEfectivo)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">− Egresos en efectivo</dt>
              <dd className="font-medium text-red-600">
                {formatCurrency(egresosEfectivo)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <dt className="font-semibold text-dark">Esperado en caja</dt>
              <dd className="text-base font-bold text-dark">
                {formatCurrency(efectivoEsperado)}
              </dd>
            </div>
          </dl>
        </div>

        <Input
          label="Monto contado (efectivo físico)"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={montoContado}
          onChange={(e) => setMontoContado(e.target.value)}
        />

        {valido && (
          <div
            className={
              diferencia === 0
                ? 'rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-700'
                : diferencia > 0
                  ? 'rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success'
                  : 'rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-600'
            }
          >
            {diferencia === 0
              ? 'Caja cuadrada: sin diferencia.'
              : diferencia > 0
                ? `Sobrante: ${formatCurrency(diferencia)}`
                : `Faltante: ${formatCurrency(Math.abs(diferencia))}`}
          </div>
        )}

        <Input
          label="Nota de cierre (opcional)"
          placeholder="Ej. Diferencia por vuelto mal dado"
          value={notaCierre}
          onChange={(e) => setNotaCierre(e.target.value)}
        />
      </div>
    </Modal>
  )
}
