'use client'

import { useState } from 'react'
import { Mail, Lock, User as UserIcon, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { useCrearOperador } from '@/hooks/usuarios/useStaff'
import { useLocalesEmpresa } from '@/hooks/locales/useLocalesEmpresa'
import type { RolStaff } from '@/types/staff'

interface Props {
  onSuccess?: () => void
  onCancel?: () => void
}

const ROLES: { value: RolStaff; label: string; description: string }[] = [
  {
    value: 'OPERADOR',
    label: 'Operador',
    description: 'Gestiona reservas y caja del local',
  },
  {
    value: 'ADMIN_LOCAL',
    label: 'Administrador de local',
    description: 'Control total del local asignado',
  },
]

export function OperadorForm({ onSuccess, onCancel }: Props) {
  const crear = useCrearOperador()
  const { locales, isLoading: loadingLocales } = useLocalesEmpresa()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [telefono, setTelefono] = useState('')
  const [rol, setRol] = useState<RolStaff>('OPERADOR')
  const [localId, setLocalId] = useState('')
  const [error, setError] = useState<string>()

  const onSubmit = async () => {
    setError(undefined)
    if (!nombre.trim()) return setError('Ingresa el nombre del empleado')
    if (!apellido.trim()) return setError('Ingresa el apellido del empleado')
    if (!email.trim()) return setError('Ingresa el email del empleado')
    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres')
    }
    if (!localId) return setError('Selecciona el local del empleado')

    try {
      await crear.mutateAsync({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
        telefono: telefono.trim() || undefined,
        rol,
        localId,
      })
      onSuccess?.()
    } catch {
      // El interceptor de axios ya muestra el toast de error.
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-primary-50 px-3 py-2.5 text-xs text-primary-700">
        El empleado podrá iniciar sesión con su email y contraseña para gestionar
        el local que le asignes.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          leftIcon={<UserIcon size={16} />}
          placeholder="Carlos"
        />
        <Input
          label="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          placeholder="Pérez"
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} />}
        placeholder="operador@correo.pe"
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={16} />}
        hint="Mínimo 8 caracteres. Compártesela al empleado."
        placeholder="••••••••"
      />

      <Input
        label="Teléfono (opcional)"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        leftIcon={<Phone size={16} />}
        placeholder="+51999888777"
      />

      <SearchableSelect
        label="Rol"
        options={ROLES.map((r) => ({
          value: r.value,
          label: r.label,
          description: r.description,
        }))}
        value={rol}
        onChange={(v) => setRol(v as RolStaff)}
        placeholder="Selecciona un rol"
      />

      <SearchableSelect
        label="Local"
        options={locales.map((l) => ({ value: l.id, label: l.nombre }))}
        value={localId}
        onChange={setLocalId}
        placeholder="Selecciona el local"
        emptyText="No tienes locales registrados"
        loading={loadingLocales}
      />

      {error && (
        <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
        {onCancel && (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="button" onClick={onSubmit} loading={crear.isPending}>
          Agregar al equipo
        </Button>
      </div>
    </div>
  )
}
