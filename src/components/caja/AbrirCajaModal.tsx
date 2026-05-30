'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAbrirCaja } from '@/hooks/caja/useCaja'

interface Props {
  isOpen: boolean
  onClose: () => void
  localId: string
}

export function AbrirCajaModal({ isOpen, onClose, localId }: Props) {
  const [montoInicial, setMontoInicial] = useState('')
  const [notaApertura, setNotaApertura] = useState('')
  const abrir = useAbrirCaja()

  const montoNum = Number(montoInicial)
  const valido = montoInicial !== '' && !Number.isNaN(montoNum) && montoNum >= 0

  function cerrar() {
    setMontoInicial('')
    setNotaApertura('')
    onClose()
  }

  function guardar() {
    if (!valido) return
    abrir.mutate(
      {
        localId,
        montoInicial: montoNum,
        notaApertura: notaApertura.trim() || undefined,
      },
      { onSuccess: cerrar },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={cerrar}
      title="Abrir caja"
      description="Indica con cuánto efectivo empiezas el turno."
      footer={
        <>
          <Button variant="ghost" onClick={cerrar} disabled={abrir.isPending}>
            Cancelar
          </Button>
          <Button onClick={guardar} loading={abrir.isPending} disabled={!valido}>
            Abrir caja
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Monto inicial (efectivo en caja)"
          type="number"
          min={0}
          step="0.01"
          placeholder="0.00"
          value={montoInicial}
          onChange={(e) => setMontoInicial(e.target.value)}
        />
        <Input
          label="Nota de apertura (opcional)"
          placeholder="Ej. Sencillo para vueltos"
          value={notaApertura}
          onChange={(e) => setNotaApertura(e.target.value)}
        />
      </div>
    </Modal>
  )
}
