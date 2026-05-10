'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import {
  useAgregarTelefonoEmpresa,
  useEliminarTelefonoEmpresa,
} from '@/hooks/empresas/useEmpresaActual'
import {
  TIPO_TELEFONO,
  telefonoEmpresaSchema,
  type TelefonoEmpresaFormData,
} from '@/validators/empresas/empresa.schema'
import type { TelefonoEmpresa, TipoTelefono } from '@/types'

const TIPO_LABEL: Record<TipoTelefono, string> = {
  PRINCIPAL: 'Principal',
  WHATSAPP: 'WhatsApp',
  REFERENCIA: 'Referencia',
}

const TIPO_VARIANT: Record<TipoTelefono, 'primary' | 'success' | 'neutral'> = {
  PRINCIPAL: 'primary',
  WHATSAPP: 'success',
  REFERENCIA: 'neutral',
}

interface Props {
  telefonos: TelefonoEmpresa[]
}

export function TelefonosEmpresa({ telefonos }: Props) {
  const agregar = useAgregarTelefonoEmpresa()
  const eliminar = useEliminarTelefonoEmpresa()
  const [target, setTarget] = useState<TelefonoEmpresa | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TelefonoEmpresaFormData>({
    resolver: zodResolver(telefonoEmpresaSchema),
    defaultValues: {
      codigoPais: '+51',
      numero: '',
      tipo: 'PRINCIPAL',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    await agregar.mutateAsync(data)
    reset({ codigoPais: '+51', numero: '', tipo: 'PRINCIPAL' })
  })

  const tipo = watch('tipo')

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {telefonos.length === 0 && (
          <li className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-500">
            Aún no has registrado teléfonos de contacto.
          </li>
        )}
        {telefonos.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                <Phone size={14} />
              </span>
              <div>
                <p className="text-sm font-semibold text-dark">
                  {t.codigoPais} {t.numero}
                </p>
                <Badge variant={TIPO_VARIANT[t.tipo]} size="sm">
                  {TIPO_LABEL[t.tipo]}
                </Badge>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTarget(t)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
              aria-label="Eliminar teléfono"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      {/* Form para agregar */}
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
          Agregar teléfono
        </p>
        <div className="grid gap-3 md:grid-cols-[100px_1fr_180px]">
          <Input
            placeholder="+51"
            {...register('codigoPais')}
            error={errors.codigoPais?.message}
          />
          <Input
            placeholder="999888777"
            {...register('numero')}
            error={errors.numero?.message}
          />
          <SearchableSelect
            options={TIPO_TELEFONO.map((t) => ({
              label: TIPO_LABEL[t],
              value: t,
            }))}
            value={tipo}
            onChange={(v) => setValue('tipo', v as TipoTelefono)}
            error={errors.tipo?.message}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            type="submit"
            size="sm"
            leftIcon={<Plus size={14} />}
            loading={agregar.isPending}
          >
            Agregar
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={!!target}
        title="Eliminar teléfono"
        description={
          target
            ? `¿Eliminar el teléfono ${target.codigoPais} ${target.numero}?`
            : ''
        }
        variant="danger"
        confirmLabel="Eliminar"
        loading={eliminar.isPending}
        onConfirm={async () => {
          if (target) await eliminar.mutateAsync(target.id)
          setTarget(null)
        }}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}
