'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useEditarEmpresa } from '@/hooks/empresas/useEmpresaActual'
import {
  updateEmpresaSchema,
  type UpdateEmpresaFormData,
} from '@/validators/empresas/empresa.schema'
import type { Empresa } from '@/types'

interface Props {
  empresa: Empresa
}

export function EmpresaForm({ empresa }: Props) {
  const editar = useEditarEmpresa()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateEmpresaFormData>({
    resolver: zodResolver(updateEmpresaSchema),
    defaultValues: {
      nombre: empresa.nombre,
      logoUrl: empresa.logoUrl ?? '',
    },
  })

  // Si la empresa cambia desde otro lugar (refetch), resetear los defaults
  useEffect(() => {
    reset({ nombre: empresa.nombre, logoUrl: empresa.logoUrl ?? '' })
  }, [empresa, reset])

  const onSubmit = handleSubmit(async (data) => {
    await editar.mutateAsync(data)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Razón social"
        leftIcon={<Building2 size={16} />}
        {...register('nombre')}
        error={errors.nombre?.message}
      />
      <Input
        label="Logo (URL)"
        leftIcon={<ImageIcon size={16} />}
        placeholder="https://..."
        {...register('logoUrl')}
        error={errors.logoUrl?.message}
        hint="Opcional. Lo verán los clientes en tu listado público."
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={editar.isPending}
          disabled={!isDirty || editar.isPending}
        >
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
