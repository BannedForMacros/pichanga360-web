'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Hash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DatePicker } from '@/components/ui/DatePicker'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useRegistrarPagoSuscripcion } from '@/hooks/suscripciones/usePagosSuscripcion'
import {
  METODOS_PAGO,
  METODO_LABEL,
  registrarPagoSuscripcionSchema,
  type RegistrarPagoSuscripcionFormData,
} from '@/validators/suscripciones/pago-suscripcion.schema'
import type { MetodoPago, Plan, Suscripcion } from '@/types'

interface Props {
  suscripciones: (Suscripcion & { plan?: Plan })[]
  defaultSuscripcionId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

function nombreSuscripcion(s: Suscripcion & { plan?: Plan }) {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('es-PE', { dateStyle: 'short' }).format(
      new Date(iso),
    )
  return `${s.plan?.nombre ?? 'Plan'} · ${fmt(s.fechaInicio)} → ${fmt(s.fechaVencimiento)}`
}

export function PagoSuscripcionForm({
  suscripciones,
  defaultSuscripcionId,
  onSuccess,
  onCancel,
}: Props) {
  const registrar = useRegistrarPagoSuscripcion()

  const susInicial =
    suscripciones.find((s) => s.id === defaultSuscripcionId) ??
    suscripciones.find((s) => s.estado === 'ACTIVA') ??
    suscripciones[0]

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistrarPagoSuscripcionFormData>({
    resolver: zodResolver(registrarPagoSuscripcionSchema),
    defaultValues: {
      suscripcionId: susInicial?.id ?? '',
      monto: susInicial?.plan ? Number(susInicial.plan.precioMensual) : 0,
      metodoPago: 'YAPE',
      referencia: '',
      periodoInicio: susInicial?.fechaInicio?.slice(0, 10) ?? '',
      periodoFin: susInicial?.fechaVencimiento?.slice(0, 10) ?? '',
    },
  })

  const suscripcionId = watch('suscripcionId')
  const metodoPago = watch('metodoPago')

  const onSubmit = handleSubmit(async (data) => {
    await registrar.mutateAsync(data)
    onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <SearchableSelect
        label="Suscripción"
        options={suscripciones.map((s) => ({
          label: nombreSuscripcion(s),
          value: s.id,
          description: s.estado,
        }))}
        value={suscripcionId}
        onChange={(v) => setValue('suscripcionId', v)}
        error={errors.suscripcionId?.message}
        placeholder="Selecciona la suscripción"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Monto (S/)"
          type="number"
          step="0.01"
          {...register('monto', { valueAsNumber: true })}
          error={errors.monto?.message}
        />
        <SearchableSelect
          label="Método de pago"
          options={METODOS_PAGO.map((m) => ({
            label: METODO_LABEL[m],
            value: m,
          }))}
          value={metodoPago}
          onChange={(v) => setValue('metodoPago', v as MetodoPago)}
          error={errors.metodoPago?.message}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DatePicker
          label="Periodo desde"
          {...register('periodoInicio')}
          error={errors.periodoInicio?.message}
        />
        <DatePicker
          label="Periodo hasta"
          {...register('periodoFin')}
          error={errors.periodoFin?.message}
        />
      </div>

      <Input
        label="Referencia"
        leftIcon={<Hash size={16} />}
        placeholder="N° operación / comprobante"
        {...register('referencia')}
        error={errors.referencia?.message}
        hint="Opcional. Útil para conciliar con tu app de pagos."
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
