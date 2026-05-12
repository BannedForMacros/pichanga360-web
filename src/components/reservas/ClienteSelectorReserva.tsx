'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, Plus, Search, User, X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import {
  useBuscarUsuarios,
  useCrearClienteWalkin,
} from '@/hooks/usuarios/useUsuarios'
import {
  clienteWalkinSchema,
  type ClienteWalkinFormData,
} from '@/validators/usuarios/walkin.schema'
import { cn } from '@/lib/utils'
import type { Usuario } from '@/types'

interface Props {
  value: Usuario | null
  onChange: (cliente: Usuario | null) => void
  error?: string
}

export function ClienteSelectorReserva({ value, onChange, error }: Props) {
  const [modo, setModo] = useState<'buscar' | 'crear'>('buscar')
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const { data: resultados, isLoading } = useBuscarUsuarios(debounced, 8)
  const crearWalkin = useCrearClienteWalkin()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteWalkinFormData>({
    resolver: zodResolver(clienteWalkinSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
    },
  })

  const onCrear = handleSubmit(async (data) => {
    const nuevo = await crearWalkin.mutateAsync(data)
    onChange(nuevo)
    reset()
    setModo('buscar')
  })

  if (value) {
    return (
      <div className="rounded-xl border-2 border-primary bg-primary-50 p-3">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-primary">
          Cliente seleccionado
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              name={`${value.nombre} ${value.apellido}`}
              src={value.avatarUrl ?? undefined}
              size="md"
            />
            <div>
              <p className="font-semibold text-dark">
                {value.nombre} {value.apellido}
              </p>
              <p className="flex items-center gap-3 text-xs text-gray-600">
                {value.telefono && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={11} /> {value.telefono}
                  </span>
                )}
                {value.email && !value.email.includes('walkin.pichanga360') && (
                  <span className="inline-flex items-center gap-1">
                    <Mail size={11} /> {value.email}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white hover:text-red-600"
            aria-label="Cambiar cliente"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-dark">
        Cliente
      </label>

      {/* Tabs Buscar / Crear */}
      <div className="mb-2 inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setModo('buscar')}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition',
            modo === 'buscar'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-primary',
          )}
        >
          <Search size={12} /> Buscar
        </button>
        <button
          type="button"
          onClick={() => setModo('crear')}
          className={cn(
            'inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold transition',
            modo === 'crear'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-primary',
          )}
        >
          <Plus size={12} /> Crear nuevo
        </button>
      </div>

      {modo === 'buscar' ? (
        <div>
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Busca por nombre, apellido o email"
              className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {search.trim().length < 2 ? (
            <p className="mt-2 text-xs text-gray-500">
              Escribe al menos 2 letras para buscar clientes existentes.
            </p>
          ) : isLoading ? (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Spinner size="sm" /> Buscando…
            </div>
          ) : !resultados?.data?.length ? (
            <p className="mt-2 text-xs text-gray-500">
              No encontramos clientes. Crea uno nuevo desde la pestaña{' '}
              <button
                type="button"
                onClick={() => setModo('crear')}
                className="font-semibold text-primary hover:underline"
              >
                Crear nuevo
              </button>
              .
            </p>
          ) : (
            <ul className="mt-2 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white p-1">
              {resultados.data.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(u)
                      setSearch('')
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-primary-50"
                  >
                    <Avatar
                      name={`${u.nombre} ${u.apellido}`}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-dark">
                        {u.nombre} {u.apellido}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {u.telefono ?? u.email}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
          <p className="mb-3 text-xs text-gray-600">
            Datos mínimos del cliente. Email es opcional — si no lo tienes,
            puedes registrar solo nombre y teléfono.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Nombre"
              leftIcon={<User size={14} />}
              placeholder="Carlos"
              {...register('nombre')}
              error={errors.nombre?.message}
            />
            <Input
              label="Apellido"
              placeholder="Pérez"
              {...register('apellido')}
              error={errors.apellido?.message}
            />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <Input
              label="Teléfono"
              leftIcon={<Phone size={14} />}
              placeholder="+51999888777"
              {...register('telefono')}
              error={errors.telefono?.message}
              hint="Para recordar reservas por WhatsApp"
            />
            <Input
              label="Email (opcional)"
              type="email"
              leftIcon={<Mail size={14} />}
              placeholder="cliente@correo.pe"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={onCrear}
              loading={crearWalkin.isPending}
            >
              Crear y seleccionar
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
