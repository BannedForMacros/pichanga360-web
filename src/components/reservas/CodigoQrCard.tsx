'use client'

import QRCode from 'react-qr-code'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  /** El código que el operador escanea para el check-in */
  codigo: string
  /** Información contextual a mostrar bajo el QR (ej: "Cancha 1 · 19:00") */
  contexto?: string
}

export function CodigoQrCard({ codigo, contexto }: Props) {
  const [copiado, setCopiado] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      toast.success('Código copiado', { position: 'top-right' })
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('No se pudo copiar', { position: 'top-right' })
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl border-4 border-primary bg-white p-4 shadow-md">
        <QRCode
          value={codigo}
          size={208}
          bgColor="#FFFFFF"
          fgColor="#1B3F72"
          level="M"
        />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Tu código de acceso
        </p>
        <p className="mt-1 break-all font-mono text-sm font-bold text-dark">
          {codigo}
        </p>
        {contexto && (
          <p className="mt-1 text-xs text-gray-500">{contexto}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-100"
      >
        {copiado ? <Check size={14} /> : <Copy size={14} />}
        {copiado ? 'Copiado' : 'Copiar código'}
      </button>
      <p className="max-w-sm text-center text-xs text-gray-500">
        Muéstralo al operador del local cuando llegues. Él escanea y tu reserva
        pasa a "En curso".
      </p>
    </div>
  )
}
