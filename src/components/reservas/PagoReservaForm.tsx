'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Hash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useRegistrarPagoReserva } from '@/hooks/reservas/usePagosReserva'
import {
  METODOS_PAGO_RESERVA,
  METODO_PAGO_LABEL,
  registrarPagoReservaSchema,
  type RegistrarPagoReservaFormData,
} from '@/validators/reservas/pago-reserva.schema'
import { formatCurrency } from '@/lib/utils'
import type { MetodoPago } from '@/types'

interface Props {
  reservaId: string
  /** Monto sugerido (estimado desde tarifa) */
  montoSugerido?: number
  /** Total a pagar (precio completo del alquiler). Si no se sabe, se omite. */
  total?: number
  /** Pagado hasta el momento (suma de pagos anteriores). */
  pagado?: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function PagoReservaForm({
  reservaId,
  montoSugerido,
  total,
  pagado,
  onSuccess,
  onCancel,
}: Props) {
  const registrar = useRegistrarPagoReserva()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrarPagoReservaFormData>({
    resolver: zodResolver(registrarPagoReservaSchema),
    defaultValues: {
      monto: montoSugerido ?? ('' as unknown as number),
      metodoPago: 'YAPE',
      referencia: '',
    },
  })

  const metodoPago = watch('metodoPago')

  const onSubmit = handleSubmit(async (data) => {
    await registrar.mutateAsync({ reservaId, data })
    onSuccess?.()
  })

  const saldo =
    typeof total === 'number' ? Math.max(0, total - (pagado ?? 0)) : undefined

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {typeof total === 'number' && total > 0 && (
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3 text-center">
          <TotalTile label="Total" valor={formatCurrency(total)} tono="dark" />
          <TotalTile
            label="Pagado"
            valor={formatCurrency(pagado ?? 0)}
            tono="success"
          />
          <TotalTile
            label="Saldo"
            valor={formatCurrency(saldo ?? 0)}
            tono={saldo && saldo > 0 ? 'warning' : 'muted'}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Monto recibido (S/)"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ej. 30.00"
          {...register('monto', { valueAsNumber: true })}
          error={errors.monto?.message}
          hint={
            montoSugerido
              ? `Sugerido para cubrir el saldo: S/ ${montoSugerido.toFixed(2)}`
              : 'Anota lo que el cliente te entregó (puede ser un adelanto).'
          }
        />
        <SearchableSelect
          label="¿Cómo te pagó?"
          options={METODOS_PAGO_RESERVA.map((m) => ({
            label: METODO_PAGO_LABEL[m],
            value: m,
          }))}
          value={metodoPago}
          onChange={(v) => setValue('metodoPago', v as MetodoPago)}
          error={errors.metodoPago?.message}
        />
      </div>

      <Input
        label="Referencia o N° de operación (opcional)"
        leftIcon={<Hash size={16} />}
        placeholder="Ej. número de Yape u operación bancaria"
        {...register('referencia')}
        error={errors.referencia?.message}
        hint="Útil para cuadrar caja después. Si pagó en efectivo, déjalo en blanco."
      />

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={registrar.isPending}>
          Registrar pago
        </Button>
      </div>
    </form>
  )
}

type TonoTotal = 'dark' | 'success' | 'warning' | 'muted'

const TONO_TOTAL: Record<TonoTotal, string> = {
  dark: 'text-dark',
  success: 'text-success-700',
  warning: 'text-warning-700',
  muted: 'text-gray-500',
}

function TotalTile({
  label,
  valor,
  tono,
}: {
  label: string
  valor: string
  tono: TonoTotal
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold ${TONO_TOTAL[tono]}`}>{valor}</p>
    </div>
  )
}
