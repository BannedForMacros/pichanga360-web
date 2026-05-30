# Contexto1 — Bitácora de trabajo (sesión 2026-05-28 → 2026-05-30)

> Resumen de todo lo implementado en esta sesión sobre Pichanga360
> (`pichanga360-backend` NestJS 11 + Prisma 7 + PostgreSQL 17, `pichanga360-web`
> Next.js 16 + React 19). Cada bloque indica qué se hizo, archivos clave y estado
> de verificación. Para el contexto general del proyecto ver `CLAUDE.md`.

Convención de verificación usada en todo: `npx tsc --noEmit` (back y front),
`npx eslint` sobre archivos tocados. "No probado en runtime" = verificado a nivel
de tipos/compilación, sin levantar la app salvo donde se indique.

---

## 1. PASO B — Lado público dueño-first (HECHO)

Objetivo: el externo **solo ve canchas + horarios + contacto**, ya **no
auto-reserva**.

### B.1 Backend — exponer teléfono + dirección del local
- `pichanga360-backend/src/modules/canchas/canchas.service.ts → findOne`: se
  amplió el `select` del `local` para devolver dirección completa
  (`calle, numero, distrito, provincia, departamento, pais, latitud, longitud`)
  y la relación `telefonos` (`codigoPais, numero, tipo`). Antes solo devolvía
  `id, nombre, empresaId` (por eso la dirección llegaba `undefined`).

### B.2 Frontend — quitar auto-reserva + cablear contacto
- `pichanga360-web/src/app/(public)/cancha/[id]/page.tsx`: se eliminó la
  auto-reserva (función `abrirReserva`, `<Modal>` con `<ReservaForm>`, botón
  "Reservar ahora", redirect a `/login`). Los horarios quedan **informativos**
  (libre/ocupado, sin acción). Se cableó **"Contactar por WhatsApp"**
  (`buildWhatsAppLink`, prefiere teléfono tipo `WHATSAPP` → cae a `PRINCIPAL`) +
  botón **"Llamar"** (`tel:`), con el número visible.
- `components/public/CanchaCard.tsx`: el CTA "Reservar →" pasó a "Ver cancha →".

### Ocultar registro de cliente externo
- Los CTA de dueño (Navbar "Registrar mi cancha", Footer "Para dueños",
  `CanchasDestacadas` "¿Eres dueño?") apuntaban por error a `/registro` (que es
  "Crea tu cuenta de jugador"). Se repuntaron a `/registro-empresa`. Así se
  arregla el mislink y se deja sin entradas públicas el registro de cliente.
- NO se borró `/registro` ni `ReservaForm`/hooks (se pueden reactivar después).

---

## 2. MEJORAS OPERATIVAS DEL DUEÑO (HECHO)

### Fix del dashboard
- `(dashboard)/dashboard/page.tsx`: "Ingresos del mes" ahora suma **solo pagos
  `PAGADO`** (antes contaba PENDIENTE y DEVUELTO, inflando la cifra). La
  ocupación usa **horas reservadas reales** (duración de cada reserva) vs
  `canchas × 14h`, en vez del conteo plano.

### Caja del día (página nueva)
- `(dashboard)/caja/page.tsx`: cobrado / por cobrar / devuelto del día, con
  **desglose por método** (Efectivo/Yape/Plin/Transferencia), tabla de cobros y
  selector de fecha. Reutiliza `useReservas` (sin endpoint nuevo en esta fase).

### UI de Lista de espera (página nueva)
- `(dashboard)/lista-espera/page.tsx` + `hooks/reservas/useListaEspera.ts`:
  ver la cola por cancha (agrupada por franja), **contactar por WhatsApp** y
  **quitar** de la lista. Selector de cancha (`SearchableSelect`).

### Recordatorios push al dueño (cron)
- Se instaló `@nestjs/schedule` + `ScheduleModule.forRoot()`.
- `src/modules/recordatorios/` (`recordatorios.service.ts` + module): cron
  **resumen 20:00 hora Perú** ("Mañana tienes N reservas confirmadas") + **nudge
  ~2h antes** de cada reserva, vía `WebPushService.sendToLocalOperators`. Ventana
  de 15 min = sin duplicados.
- **Limitación:** el recordatorio NO llega al cliente externo (WhatsApp no se
  auto-envía sin WhatsApp Business API; los clientes no tienen token push). Va al
  dueño/operadores para que ellos manden el WhatsApp manual.

### Sidebar
- "Caja del día" y "Lista de espera" agregados como enlaces fijos en la sección
  "General" (`components/dashboard/Sidebar.tsx`, array `fijos`).

---

## 3. LISTA DE ESPERA — el dueño puede AGREGAR clientes (HECHO)

- **Backend:** `CreateListaEsperaDto` acepta `clienteId?` opcional;
  `lista-espera.service.create` resuelve el cliente igual que reservas
  recurrentes: si `clienteId` ≠ usuario, exige ser admin/operador del local
  (`assertPuedeOperarLocal`) y valida que el cliente exista/activo.
- **Frontend:** `components/reservas/ListaEsperaForm.tsx` (reusa
  `ClienteSelectorReserva`, `DatePicker`, `TimePicker`, duración) + botón
  "+ Agregar cliente" y modal en la página de lista de espera. Hook
  `useAgregarListaEspera`.

---

## 4. HARDENING PARA PRODUCCIÓN (HECHO)

Auditoría de seguridad multi-tenant + correctitud. Correcciones:

### Aislamiento multi-tenant (fuga de datos entre empresas) — CRÍTICO
- `usuarios.service.findAll`: antes devolvía **TODOS** los usuarios del sistema.
  Ahora filtra "clientes" por la empresa/local del usuario (relación
  `reservasComoCliente`). La página "Clientes" ya no muestra clientes de otras
  empresas.
- Se agregó validación de **ownership del local** (patrón `assertPuedeOperarLocal`
  + criterio cliente-dueño) en: `pagos-reserva`, `pedidos-snack`, `ventas-snack`
  (ya no acepta cualquier `?localId=`), `lista-espera` (findByCancha/remove),
  `notificaciones` (whatsapp) y `reservas.findByQr` (ahora pide `user` +
  `assertViewAccess`).

### Anti doble-reserva (race condition) — ALTO
- `reservas.service.create` y `update`: ahora toman un
  `pg_advisory_xact_lock(hashtextextended(canchaId,0))` y **revalidan el
  solapamiento DENTRO de la transacción** (`validarHorarioYOverlap` recibe el
  `tx`; filtra `deletedAt: null` explícito). Evita que dos reservas concurrentes
  se pisen en el mismo horario.

### Precio S/0 — ALTO
- `components/reservas/ReservaForm.tsx`: distingue "sin tarifa configurada" de
  "tarifa 0 válida"; muestra banner de advertencia y exige confirmación explícita
  o monto manual (sin bloquear el caso legítimo).

### Cuenta / contraseña + dead-ends — BLOQUEANTE
- Nueva página `(dashboard)/cuenta` ("Mi cuenta") + `CambiarPasswordForm` + hook
  `useCambiarPassword` (`POST /auth/change-password`, campos
  `passwordActual`/`passwordNueva`; el backend revoca sesiones → cierra sesión
  tras cambiar).
- Sidebar: "Configuración" → `/empresas/me`; "Soporte" → `mailto`. UserMenu:
  "Mi cuenta" → `/cuenta`.

---

## 5. FEATURES OPERATIVOS #1 #2 #3 (HECHO) — requiere migración (ya aplicada)

> Estos agregaron cambios de schema. **La migración
> `20260530202022_staff_caja_noshow` YA fue creada y aplicada** a la BD local
> (`localhost:5432/pichangape`). Es aditiva (ADD VALUE enum + 2 tablas nuevas,
> sin DROPs). En otros entornos correr `npx prisma migrate deploy`.

### #1 — Gestión de staff / operadores
- **Backend:** `POST /usuarios/operador` (crea empleado con email+contraseña y
  rol OPERADOR/ADMIN_LOCAL scoped a un local de la empresa; valida ownership y
  email único, hashea password) + `GET /usuarios/staff` (lista el equipo de la
  empresa). DTO `crear-operador.dto.ts`. No requirió schema (usa Usuario +
  UsuarioRol).
- **Frontend:** página `(dashboard)/equipo/page.tsx` + `hooks/usuarios/useStaff.ts`
  + `components/equipo/OperadorForm.tsx` y `StaffTabla.tsx` + tipos en
  `src/types/staff.ts`. Enlace fijo "Equipo" en el sidebar.

### #2 — Arqueo de caja + egresos
- **Schema:** modelos `CajaSesion` y `EgresoCaja` + enum `EstadoCajaSesion`
  (ABIERTA/CERRADA), con relaciones a Local y Usuario (abiertaPor/cerradaPor/
  registradoPor).
- **Backend:** módulo `src/modules/caja/` — `POST /locales/:localId/caja/abrir`,
  `GET /locales/:localId/caja/actual`, `POST /caja/:sesionId/cerrar`,
  `POST /locales/:localId/egresos`, `GET /locales/:localId/egresos`,
  `GET /locales/:localId/caja/resumen`, `DELETE /egresos/:id`. Todos validan
  ownership del local.
- **Frontend:** `/caja` extendido con estado de caja (Abrir/Cerrar), egresos del
  día (registrar/eliminar) y **arqueo al cerrar** (efectivo esperado = inicial +
  cobrado efectivo − egresos efectivo, vs contado → sobrante/faltante).
  `hooks/caja/useCaja.ts` + `components/caja/*`. Tipos al final de `types/index.ts`.

### #3 — No-show
- **Schema:** valor `NO_SHOW` agregado al enum `EstadoReserva`.
- **Backend:** `TRANSICIONES` (NO_SHOW alcanzable desde CONFIRMADA/EN_CURSO,
  terminal) + `cancelar` lo trata como final. No ocupa la cancha (la libera).
- **Frontend:** botón "Marcar como no asistió" en `DetalleReservaModal`;
  badge/tab en `TablaReservas`, color en `CalendarioSemanal`, label en
  `MisReservasList` y `useReservasMutations`; **excluido de ingresos/ocupación**
  en dashboard, reportes y caja.

---

## ESTADO DE VERIFICACIÓN (final)
- Backend `npx tsc --noEmit` → **exit 0**
- Frontend `npx tsc --noEmit` → **exit 0**
- `eslint` sobre archivos tocados → **0 errores** (solo warnings preexistentes)
- BD: migración aplicada, `prisma migrate status` → "Database schema is up to date!"
- NO se hizo prueba de humo en runtime (levantar la app y hacer clics).

---

## PENDIENTES (no implementados)
- **Recordatorio automático real al cliente** → requiere WhatsApp Business API
  (servicio externo de pago, proyecto aparte).
- **Auto-aviso a lista de espera** al primero de la cola cuando se cancela una
  reserva (hoy el dueño revisa la lista a mano).
- **Buscar/filtrar reservas** en la tabla (por cliente/fecha/estado).
- **Cron de marcado automático de NO_SHOW** (si pasó la hora sin check-in).
- **Robustez extra anti doble-reserva:** constraint de exclusión Postgres
  (btree_gist). El advisory lock actual ya es sólido para la escala esperada.
- Prueba de humo en runtime de las features nuevas.
