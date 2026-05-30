'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRegistrarEgreso } from '@/hooks/caja/useCaja'
import type { MetodoPago } from '@/types'

const METODOS: { key: MetodoPago; label: string }[] = [
  { key: 'EFECTIVO', label: 'Efectivo' },
  { key: 'YAPE', label: 'Yape' },
  { key: 'PLIN', label: 'Plin' },
  { key: 'TRANSFERENCIA', label: 'Transferencia' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  localId: string
  /** Sesión abierta a la que atar el egreso (si la hay). */
  cajaSesionId?: string
}

export function EgresoFormModal({
  isOpen,
  onClose,
  localId,
  cajaSesionId,
}: Props) {
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO')
  const registrar = useRegistrarEgreso()

  const montoNum = Number(monto)
  const valido = concepto.trim().length > 0 && montoNum > 0

  function cerrar() {
    setConcepto('')
    setMonto('')
    setMetodoPago('EFECTIVO')
    onClose()
  }

  function guardar() {
    if (!valido) return
    registrar.mutate(
      {
        localId,
        concepto: concepto.trim(),
        monto: montoNum,
        metodoPago,
        cajaSesionId,
      },
      { onSuccess: cerrar },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={cerrar}
      title="Registrar egreso"
      description="Anota un gasto o salida de dinero de la caja."
      footer={
        <>
          <Button variant="ghost" onClick={cerrar} disabled={registrar.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={guardar}
            loading={registrar.isPending}
            disabled={!valido}
          >
            Guardar egreso
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Concepto"
          placeholder="Ej. Compra de pelotas"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
        />
        <Input
          label="Monto"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark">
            Método de pago
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METODOS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetodoPago(m.key)}
                className={
                  metodoPago === m.key
                    ? 'rounded-xl border border-primary bg-primary-50 px-3 py-2 text-sm font-semibold text-primary'
                    : 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:border-gray-300'
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
