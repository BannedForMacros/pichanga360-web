// ============================================================
// Pichanga360 — Tipos de dominio (alineados al backend NestJS/Prisma)
// schema.prisma → estos tipos son el reflejo 1:1 de los modelos Prisma
// ============================================================

// ---------- Enums ----------
export type TipoRol =
  | 'SUPER_ADMIN'
  | 'ADMIN_EMPRESA'
  | 'ADMIN_LOCAL'
  | 'OPERADOR'
  | 'CLIENTE'

export type TipoPlan = 'BASICO' | 'PRO' | 'ENTERPRISE'

export type EstadoSuscripcion = 'ACTIVA' | 'VENCIDA' | 'SUSPENDIDA' | 'CANCELADA'

export type EstadoPagoSuscripcion =
  | 'PENDIENTE'
  | 'PAGADO'
  | 'RECHAZADO'
  | 'DEVUELTO'

export type TipoTelefono = 'PRINCIPAL' | 'WHATSAPP' | 'REFERENCIA'

export type EstadoCancha = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO'

export type TipoTarifa = 'NORMAL' | 'NOCTURNA' | 'FIN_DE_SEMANA'

export type DiaSemana =
  | 'LUNES'
  | 'MARTES'
  | 'MIERCOLES'
  | 'JUEVES'
  | 'VIERNES'
  | 'SABADO'
  | 'DOMINGO'

export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'EN_CURSO'
  | 'COMPLETADA'
  | 'CANCELADA'
  | 'NO_SHOW'

export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA'

export type EstadoPagoReserva = 'PENDIENTE' | 'PAGADO' | 'DEVUELTO'

export type EstadoVenta = 'PENDIENTE' | 'PAGADO' | 'ANULADO'

export type TipoNotificacion = 'WHATSAPP' | 'PUSH' | 'EMAIL'

export type EventoNotificacion =
  | 'CONFIRMACION_RESERVA'
  | 'RECORDATORIO_24H'
  | 'RECORDATORIO_2H'
  | 'POST_PARTIDO'
  | 'BIENVENIDA'

export type EstadoNotificacion = 'PENDIENTE' | 'ENVIADO' | 'FALLIDO'

export type PlataformaPush = 'ANDROID' | 'IOS' | 'WEB'

export type TipoResenaObjetivo = 'CANCHA' | 'LOCAL'

// ---------- Códigos visuales (no son enum del backend, son strings que usan
// los componentes de UI como CanchaSVG para elegir colores). El backend
// devuelve `Deporte.codigo` y `Superficie.codigo` como string libre, y los
// mapeamos a estos literales cuando podemos.
// ----------
export type DeporteCodigo =
  | 'FUTBOL'
  | 'VOLEY'
  | 'BASKET'
  | 'TENIS'
  | 'PADEL'
  | 'OTRO'

export type SuperficieCodigo = 'SINTETICO' | 'GRASS' | 'CEMENTO' | 'MADERA'

// ---------- Identidad ----------
export interface Usuario {
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
}

export interface RolAsignacion {
  rol: TipoRol
  empresaId: string | null
  localId: string | null
}

export interface Rol {
  id: string
  codigo: TipoRol
  nombre: string
  descripcion: string | null
}

// ---------- Auth (matchea TokenResponseDto) ----------
export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: Usuario
  roles: RolAsignacion[]
}

export interface MeResponse {
  user: Usuario
  roles: RolAsignacion[]
}

// ---------- Empresa / Local ----------
export interface TelefonoEmpresa {
  id: string
  empresaId: string
  codigoPais: string
  numero: string
  tipo: TipoTelefono
}

export interface Empresa {
  id: string
  nombre: string
  ruc: string
  logoUrl: string | null
  activa: boolean
  telefonos?: TelefonoEmpresa[]
}

export interface TelefonoLocal {
  id: string
  localId: string
  codigoPais: string
  numero: string
  tipo: TipoTelefono
}

export interface Local {
  id: string
  empresaId: string
  nombre: string
  calle: string
  numero: string
  distrito: string
  provincia: string
  departamento: string
  pais: string
  latitud: number
  longitud: number
  activo: boolean
  telefonos?: TelefonoLocal[]
  canchas?: Cancha[]
  empresa?: Empresa
}

// ---------- Catálogos ----------
export interface Deporte {
  id: string
  codigo: string
  nombre: string
  icono: string | null
  descripcion: string | null
  activo: boolean
}

export interface Superficie {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface TipoCancha {
  id: string
  empresaId: string
  deporteId: string
  nombre: string
  capacidadDefault: number
  descripcion: string | null
  activo: boolean
  deporte?: Deporte
  // Tarifas heredadas del tipo (aplican a todas las canchas del tipo si la
  // cancha no tiene un override en su propia tabla `tarifas`).
  tarifas?: Tarifa[]
}

export interface CategoriaProducto {
  id: string
  empresaId: string
  nombre: string
  orden: number
  activo: boolean
}

// ---------- Cancha / Tarifa / Horario ----------
export interface Tarifa {
  id: string
  canchaId: string | null
  tipoCanchaId: string | null
  tipo: TipoTarifa
  precioHora: number | string
  horaInicio: string
  horaFin: string
}

export interface HorarioCancha {
  id: string
  canchaId: string
  diaSemana: DiaSemana
  horaApertura: string
  horaCierre: string
}

export interface Cancha {
  id: string
  localId: string
  tipoCanchaId: string | null
  superficieId: string
  nombre: string
  capacidadJugadores: number
  fotos: string[]
  estado: EstadoCancha
  createdAt: string
  updatedAt: string
  superficie?: Superficie
  tipoCancha?: TipoCancha
  local?: Local
  tarifas?: Tarifa[]
  horarios?: HorarioCancha[]
}

// ---------- Reservas ----------
export interface PagoReserva {
  id: string
  reservaId: string
  monto: number | string
  metodoPago: MetodoPago
  estado: EstadoPagoReserva
  referencia: string | null
  fechaPago: string | null
  /** Momento de la devolución (estado DEVUELTO); null si no se devolvió. */
  fechaDevolucion?: string | null
}

export interface AuditoriaReserva {
  id: string
  reservaId: string
  usuarioId: string
  estadoAnterior: EstadoReserva | null
  estadoNuevo: EstadoReserva
  motivo: string | null
  createdAt: string
}

export interface Reserva {
  id: string
  canchaId: string
  clienteId: string
  fechaInicio: string
  fechaFin: string
  estado: EstadoReserva
  codigoQr: string
  esRecurrente: boolean
  recurrenteId: string | null
  notas: string | null
  createdAt: string
  updatedAt: string
  cancha?: Cancha
  cliente?: Usuario
  pagos?: PagoReserva[]
}

export interface ReservaRecurrente {
  id: string
  canchaId: string
  clienteId: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  fechaInicio: string
  fechaFin: string | null
  activa: boolean
  cancha?: { id: string; nombre: string; localId: string }
  cliente?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'telefono' | 'email'>
}

/** Resultado de generar reservas a partir de una reserva fija. */
export interface GenerarRecurrenteResult {
  creadas: number
  errores: { fecha: string; motivo: string }[]
}

export interface ListaEspera {
  id: string
  canchaId: string
  clienteId: string
  fechaInicio: string
  fechaFin: string
  posicion: number
  cliente?: Pick<Usuario, 'id' | 'nombre' | 'apellido' | 'telefono'>
}

// ---------- Productos / Snacks ----------
export interface Producto {
  id: string
  localId: string
  categoriaId: string
  nombre: string
  precio: number | string
  stock: number
  imagenUrl: string | null
  activo: boolean
  categoria?: CategoriaProducto
}

export interface ItemPedidoSnack {
  id: string
  pedidoId: string
  productoId: string
  cantidad: number
  precioUnitario: number | string
  subtotal: number | string
  producto?: Producto
}

export interface PedidoSnack {
  id: string
  reservaId: string
  total: number | string
  notas: string | null
  items?: ItemPedidoSnack[]
}

export interface VentaSnack {
  id: string
  pedidoId: string
  localId: string
  operadorId: string
  total: number | string
  metodoPago: MetodoPago
  estado: EstadoVenta
  referencia: string | null
  fechaVenta: string
}

// ---------- Reseñas / Notificaciones / Planes ----------
export interface Resena {
  id: string
  reservaId: string
  clienteId: string
  canchaId: string | null
  tipoObjetivo: TipoResenaObjetivo
  rating: number
  comentario: string | null
  createdAt: string
  cliente?: Usuario
}

export interface RespuestaResena {
  id: string
  resenaId: string
  empresaId: string
  contenido: string
  createdAt: string
}

export interface Notificacion {
  id: string
  usuarioId: string
  tipo: TipoNotificacion
  evento: EventoNotificacion
  estado: EstadoNotificacion
  titulo: string
  mensaje: string
  fechaEnvio: string | null
  errorMsg: string | null
  createdAt: string
}

export interface PushToken {
  id: string
  usuarioId: string
  token: string
  plataforma: PlataformaPush
  activo: boolean
}

export interface Plan {
  id: string
  codigo: TipoPlan
  nombre: string
  descripcion: string | null
  precioMensual: number | string
  maxLocales: number
  maxCanchas: number
  maxUsuarios: number
  activo: boolean
}

// ---------- Módulos (sidebar dinámico) ----------
export interface ModuloNodo {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  icono: string | null
  ruta: string | null
  orden: number
  visibleWeb: boolean
  visibleMovil: boolean
  activo: boolean
  parentId: string | null
  hijos: ModuloNodo[]
}

export interface Suscripcion {
  id: string
  empresaId: string
  planId: string
  estado: EstadoSuscripcion
  fechaInicio: string
  fechaVencimiento: string
  renovacionAutomatica: boolean
  plan?: Plan
}

// ---------- Helpers de paginación ----------
// El backend devuelve { data, meta: { page, limit, total, totalPages } }.
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
}

// ---------- Caja: arqueo/cierre + egresos ----------
export type EstadoCajaSesion = 'ABIERTA' | 'CERRADA'

interface UsuarioResumen {
  id: string
  nombre: string | null
  apellido: string | null
}

export interface EgresoCaja {
  id: string
  localId: string
  cajaSesionId: string | null
  registradoPorId: string
  concepto: string
  monto: number | string
  metodoPago: MetodoPago
  fecha: string
  registradoPor?: UsuarioResumen
}

export interface CajaSesion {
  id: string
  localId: string
  abiertaPorId: string
  cerradaPorId: string | null
  estado: EstadoCajaSesion
  montoInicial: number | string
  montoFinalContado: number | string | null
  notaApertura: string | null
  notaCierre: string | null
  abiertaEn: string
  cerradaEn: string | null
  egresos?: EgresoCaja[]
  abiertaPor?: UsuarioResumen
  cerradaPor?: UsuarioResumen
}

export interface CajaResumen {
  egresos: EgresoCaja[]
  totalEgresos: number
  /** Efectivo cobrado en el día (pagos EFECTIVO con fechaPago en el día). */
  efectivoRecibido: number
  /** Egresos pagados en efectivo en el día. */
  egresosEfectivo: number
  /** Devoluciones en efectivo del día (pagos con fechaDevolucion en el día). */
  devolucionesEfectivo: number
  /** efectivoRecibido − egresosEfectivo − devolucionesEfectivo (sin monto inicial). */
  efectivoNeto: number
}
