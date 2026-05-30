/**
 * Tipos del módulo de Equipo / Staff (gestión de operadores y admins de local).
 * Se definen aquí (y no en types/index.ts) para no tocar el archivo de tipos
 * compartido.
 */

/** Roles de staff que el dueño puede asignar a un empleado. */
export type RolStaff = 'OPERADOR' | 'ADMIN_LOCAL'

/** Asignación de rol de un usuario de staff (rol + alcance al local). */
export interface StaffRolAsignacion {
  id: string
  empresaId: string | null
  localId: string | null
  rol: { codigo: string; nombre: string }
  local: { id: string; nombre: string } | null
}

/** Usuario de staff devuelto por GET /usuarios/staff. */
export interface StaffMiembro {
  id: string
  email: string
  nombre: string
  apellido: string
  telefono: string | null
  avatarUrl: string | null
  emailVerificado: boolean
  activo: boolean
  createdAt: string
  updatedAt: string
  roles: StaffRolAsignacion[]
}

/** Payload para crear un empleado: POST /usuarios/operador. */
export interface CrearOperadorInput {
  nombre: string
  apellido: string
  email: string
  password: string
  telefono?: string
  rol: RolStaff
  localId: string
}
