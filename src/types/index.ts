// ============================================================
// Enums del dominio Pichanga360
// ============================================================

export type RolNombre = 'SUPERADMIN' | 'ADMIN_EMPRESA' | 'OPERADOR' | 'CLIENTE'

export type Deporte = 'FUTBOL' | 'VOLEY' | 'BASKET' | 'TENIS' | 'PADEL' | 'OTRO'

export type Superficie = 'SINTETICO' | 'GRASS' | 'CEMENTO' | 'MADERA'

export type EstadoCancha = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO'

export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'CANCELADA'
  | 'COMPLETADA'
  | 'NO_ASISTIO'

export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA'

export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'REEMBOLSADO' | 'FALLIDO'

export type TipoTarifa = 'NORMAL' | 'HORA_PUNTA' | 'FIN_DE_SEMANA' | 'PROMO'

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO'

export type TipoTelefono = 'FIJO' | 'CELULAR' | 'WHATSAPP'

export type PlanNombre = 'FREE' | 'BASIC' | 'PRO' | 'PREMIUM'

export type EstadoSuscripcion = 'ACTIVA' | 'CANCELADA' | 'VENCIDA' | 'TRIAL'

export type TipoNotificacion = 'PUSH' | 'EMAIL' | 'SMS'

export type EstadoNotificacion = 'PENDIENTE' | 'ENVIADA' | 'LEIDA' | 'FALLIDA'

export type EventoNotificacion =
  | 'RESERVA_CREADA'
  | 'RESERVA_CONFIRMADA'
  | 'RESERVA_CANCELADA'
  | 'RECORDATORIO'
  | 'PROMO'
  | 'PAGO_RECIBIDO'

// ============================================================
// Identidad y permisos
// ============================================================

export interface Rol {
  id: string
  nombre: RolNombre
  descripcion?: string
}

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  avatarUrl?: string
  fechaCreacion: string
  activo: boolean
  roles?: Rol[]
}

export interface UsuarioRol {
  usuarioId: string
  rolId: string
  empresaId?: string
}

// ============================================================
// Empresa y locales
// ============================================================

export interface TelefonoEmpresa {
  id: string
  empresaId: string
  numero: string
  tipo: TipoTelefono
}

export interface TelefonoLocal {
  id: string
  localId: string
  numero: string
  tipo: TipoTelefono
}

export interface Empresa {
  id: string
  razonSocial: string
  ruc: string
  emailContacto?: string
  logoUrl?: string
  fechaCreacion: string
  telefonos?: TelefonoEmpresa[]
}

export interface Local {
  id: string
  empresaId: string
  nombre: string
  direccion: string
  distrito: string
  ciudad: string
  latitud: number
  longitud: number
  fotoUrl?: string
  telefonos?: TelefonoLocal[]
}

// ============================================================
// Canchas y horarios
// ============================================================

export interface HorarioCancha {
  id: string
  canchaId: string
  dia: DiaSemana
  horaApertura: string
  horaCierre: string
}

export interface Tarifa {
  id: string
  canchaId: string
  tipo: TipoTarifa
  precio: number
  desde: string
  hasta: string
  diasAplica: DiaSemana[]
}

export interface Cancha {
  id: string
  localId: string
  nombre: string
  deporte: Deporte
  superficie: Superficie
  capacidadJugadores: number
  descripcion?: string
  estado: EstadoCancha
  precioPorHora: number
  fotoUrl?: string
  rating?: number
  totalReseñas?: number
  horarios?: HorarioCancha[]
  tarifas?: Tarifa[]
  local?: Local
}

// ============================================================
// Reservas
// ============================================================

export interface PagoReserva {
  id: string
  reservaId: string
  metodo: MetodoPago
  monto: number
  estado: EstadoPago
  fechaPago?: string
  referencia?: string
}

export interface AuditoriaReserva {
  id: string
  reservaId: string
  usuarioId: string
  accion: string
  fecha: string
  detalles?: string
}

export interface ListaEspera {
  id: string
  canchaId: string
  usuarioId: string
  fechaDeseada: string
  horaInicio: string
  horaFin: string
  notificado: boolean
}

export interface Reserva {
  id: string
  canchaId: string
  usuarioId: string
  fecha: string
  horaInicio: string
  horaFin: string
  estado: EstadoReserva
  monto: number
  notas?: string
  cancha?: Cancha
  usuario?: Usuario
  pago?: PagoReserva
  auditoria?: AuditoriaReserva[]
}

export interface ReservaRecurrente {
  id: string
  canchaId: string
  usuarioId: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  desde: string
  hasta: string
  activa: boolean
}

// ============================================================
// Bebidas / snacks
// ============================================================

export interface Producto {
  id: string
  localId: string
  nombre: string
  categoria: string
  precio: number
  stock: number
  imagenUrl?: string
  activo: boolean
}

export interface ItemPedidoSnack {
  id: string
  pedidoId: string
  productoId: string
  cantidad: number
  precioUnitario: number
  producto?: Producto
}

export interface PedidoSnack {
  id: string
  reservaId?: string
  usuarioId: string
  fecha: string
  total: number
  estado: 'PENDIENTE' | 'ENTREGADO' | 'CANCELADO'
  items?: ItemPedidoSnack[]
}

export interface VentaSnack {
  id: string
  pedidoId: string
  productoId: string
  cantidad: number
  total: number
  fecha: string
}

// ============================================================
// Reseñas
// ============================================================

export interface Reseña {
  id: string
  canchaId: string
  usuarioId: string
  puntuacion: number
  comentario?: string
  fecha: string
  usuario?: Usuario
  respuesta?: RespuestaReseña
}

export interface RespuestaReseña {
  id: string
  reseñaId: string
  texto: string
  fecha: string
}

// ============================================================
// Notificaciones
// ============================================================

export interface Notificacion {
  id: string
  usuarioId: string
  tipo: TipoNotificacion
  evento: EventoNotificacion
  titulo: string
  mensaje: string
  estado: EstadoNotificacion
  fecha: string
  leidaEn?: string
}

export interface PushToken {
  id: string
  usuarioId: string
  token: string
  dispositivo: string
  activo: boolean
}

// ============================================================
// Suscripciones / planes
// ============================================================

export interface Plan {
  id: string
  nombre: PlanNombre
  precioMensual: number
  caracteristicas: string[]
  maxCanchas: number
  maxLocales: number
}

export interface Suscripcion {
  id: string
  empresaId: string
  planId: string
  estado: EstadoSuscripcion
  inicio: string
  fin: string
  plan?: Plan
}
