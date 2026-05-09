'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import {
  productoSchema,
  type ProductoFormData,
} from '@/validators/bebidas/producto.schema'
import {
  useCrearProducto,
  useEditarProducto,
} from '@/hooks/bebidas/useProductosMutaciones'
import { useCategoriasProducto } from '@/hooks/catalogos/useCategoriasProducto'
import type { Producto } from '@/types'

interface ProductoFormProps {
  producto?: Producto
  localId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProductoForm({
  producto,
  localId,
  onSuccess,
  onCancel,
}: ProductoFormProps) {
  const isEdit = !!producto
  const crear = useCrearProducto(localId ?? producto?.localId)
  const editar = useEditarProducto()

  const { data: categorias, isLoading: loadingCategorias } =
    useCategoriasProducto()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: producto?.nombre ?? '',
      categoriaId: producto?.categoriaId ?? '',
      precio: producto?.precio ? Number(producto.precio) : 0,
      stock: producto?.stock ?? 0,
      imagenUrl: producto?.imagenUrl ?? '',
      activo: producto?.activo ?? true,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      nombre: data.nombre,
      categoriaId: data.categoriaId,
      precio: data.precio,
      imagenUrl: data.imagenUrl || undefined,
    }
    if (isEdit) {
      await editar.mutateAsync({
        id: producto!.id,
        data: { ...payload, activo: data.activo },
      })
    } else {
      await crear.mutateAsync({ ...payload, stock: data.stock })
    }
    onSuccess?.()
  })

  const submitting = crear.isPending || editar.isPending

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Nombre del producto"
        placeholder="Gatorade 500ml"
        {...register('nombre')}
        error={errors.nombre?.message}
      />

      <Controller
        name="categoriaId"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Categoría"
            options={
              categorias?.map((c) => ({ label: c.nombre, value: c.id })) ?? []
            }
            value={field.value}
            onChange={field.onChange}
            loading={loadingCategorias}
            error={fieldState.error?.message}
            placeholder="Selecciona una categoría"
            emptyText="Crea categorías en el panel de configuración"
          />
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="number"
          step="0.10"
          label="Precio (S/)"
          {...register('precio', { valueAsNumber: true })}
          error={errors.precio?.message}
        />
        <Input
          type="number"
          label="Stock"
          {...register('stock', { valueAsNumber: true })}
          error={errors.stock?.message}
          disabled={isEdit}
          hint={
            isEdit
              ? 'Para ajustar stock, usa la opción "Ajustar stock" en la tabla'
              : undefined
          }
        />
      </div>

      <Input
        label="URL de la imagen"
        placeholder="https://..."
        {...register('imagenUrl')}
        error={errors.imagenUrl?.message}
      />

      {isEdit && (
        <label className="flex items-center gap-2 text-sm text-dark">
          <input
            type="checkbox"
            {...register('activo')}
            className="accent-primary"
          />
          Producto activo
        </label>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
