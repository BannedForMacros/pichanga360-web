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
import type { Producto } from '@/types'

interface ProductoFormProps {
  producto?: Producto
  onSuccess?: () => void
  onCancel?: () => void
}

const categorias = [
  { label: 'Bebida', value: 'BEBIDA' },
  { label: 'Snack', value: 'SNACK' },
  { label: 'Hidratante', value: 'HIDRATANTE' },
  { label: 'Comida', value: 'COMIDA' },
  { label: 'Otro', value: 'OTRO' },
]

export function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const isEdit = !!producto
  const crear = useCrearProducto()
  const editar = useEditarProducto()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: producto?.nombre ?? '',
      categoria: producto?.categoria ?? 'BEBIDA',
      precio: producto?.precio ?? 0,
      stock: producto?.stock ?? 0,
      imagenUrl: producto?.imagenUrl ?? '',
      activo: producto?.activo ?? true,
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await editar.mutateAsync({ id: producto!.id, data })
    } else {
      await crear.mutateAsync(data)
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
        name="categoria"
        control={control}
        render={({ field, fieldState }) => (
          <SearchableSelect
            label="Categoría"
            options={categorias}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            placeholder="Selecciona una categoría"
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
        />
      </div>
      <Input
        label="URL de la imagen"
        placeholder="https://..."
        {...register('imagenUrl')}
        error={errors.imagenUrl?.message}
      />
      <label className="flex items-center gap-2 text-sm text-dark">
        <input
          type="checkbox"
          {...register('activo')}
          className="accent-primary"
        />
        Producto activo
      </label>
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
