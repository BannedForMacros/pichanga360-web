# Pichanga360 — Contexto del proyecto

> Documento de contexto para Claude Code. Léelo al iniciar una sesión en este repo.
> Última actualización: 2026-05-29.

## Qué es

Pichanga360 es un **PWA SaaS peruano de alquiler de canchas deportivas**. Es un
monorepo con dos proyectos hermanos:

- `pichanga360-backend/` — API REST con **NestJS 11 + Prisma 7 + PostgreSQL 17**.
- `pichanga360-web/` — frontend **Next.js 16 + React 19 + Tailwind 4** (PWA instalable).

### Dirección de producto (IMPORTANTE — leer antes de tocar nada)

El sistema se enfoca en el **DUEÑO de las canchas**. La prioridad es que para el
dueño sea **fácil y flexible** registrar/gestionar reservas.

Los usuarios **externos (no dueños)**, *por ahora*, solo deben poder:
1. Ver las canchas disponibles con sus horarios.
2. Ver un **número de contacto** (WhatsApp/llamada) para coordinar.

**NO deben auto-reservar online todavía.** El código actual del lado público
todavía tiene un flujo completo de auto-reserva del cliente que hay que
**desactivar** (ver "Paso B" más abajo). Cuando hagas cambios, mantén esta
visión: dueño-first, externo solo mira + contacta.

---

## Stack y arquitectura

### Backend (`pichanga360-backend/`)
- NestJS 11, módulos por dominio en `src/modules/<dominio>/` (controller + service + module + dto).
- Prisma 7 con cliente extendido; schema en `prisma/schema.prisma` (~1050 líneas, en español).
- **Multi-tenant**: `Empresa` → `Local` → `Cancha`. Una empresa es el tenant.
- **Roles**: `SUPER_ADMIN`, `ADMIN_EMPRESA`, `ADMIN_LOCAL`, `OPERADOR`, `CLIENTE`.
  Permisos por módulo×acción; el sidebar del frontend se arma con los módulos
  que devuelve el backend según plan/rol (`useModulosDisponibles`).
- **Soft-delete** global vía extensión (`src/prisma/extensions/soft-delete.extension.ts`);
  casi todos los modelos tienen `deletedAt`. Usa `.softDelete({ id })` para borrar.
- **Zona horaria**: la app opera en **Perú (UTC-5, sin DST)**. El backend convierte
  ISO UTC → hora local Perú restando 5h para validar horarios/día de semana
  (ver helpers en `src/modules/reservas/reservas.service.ts`). No usar `getDay()`
  dependiente de la TZ del proceso.
- Auth: JWT con refresh rotativo + revocación (`SesionRefresh`). Web Push real
  (`src/modules/push-tokens/web-push.service.ts`).
- Catálogo de reservas con **máquina de estados**:
  `PENDIENTE → CONFIRMADA → EN_CURSO → COMPLETADA` (o `CANCELADA`), con bitácora
  `AuditoriaReserva`, anti-solapamiento y validación de horario operativo.

### Frontend (`pichanga360-web/`)
- App Router de Next 16. Grupos de rutas: `(public)`, `(dashboard)`, `(onboarding)`.
- **⚠️ `pichanga360-web/AGENTS.md` advierte: esta versión de Next (16) tiene
  breaking changes respecto a lo que conoces. Antes de escribir código que toque
  APIs de Next, lee la guía en `node_modules/next/dist/docs/`.** Para cambios de
  pura lógica React (componentes, hooks) replica los patrones de los archivos
  existentes del repo (que ya usan Next 16 correctamente) — esa es la mejor guía.
- Datos: **React Query** (`@tanstack/react-query`). Hooks en `src/hooks/<dominio>/`.
  Cliente axios en `src/lib/api.ts` (interceptor muestra toasts de error).
- Forms: **react-hook-form + zod** (validadores en `src/validators/`).
- UI propia en `src/components/ui/` (Button, Modal, SearchableSelect, DatePicker,
  TimePicker, Badge, ConfirmModal, Spinner, etc.). Tailwind 4.
- PWA: `public/manifest.webmanifest` + `public/sw.js` (solo Web Push; **sin caché
  offline todavía**, por decisión).
- Helper de WhatsApp ya disponible: `buildWhatsAppLink(telefono, mensaje?)` en
  `src/lib/utils.ts` (normaliza celular peruano a `wa.me`).

---

## Convenciones al trabajar

- **Idioma**: todo en español (UI, comentarios, nombres de dominio). El dueño es
  peruano; copys cercanos y claros ("¿Para quién es la reserva?").
- **Verificar siempre** antes de dar por hecho un cambio:
  - Backend: `cd pichanga360-backend && npx tsc --noEmit` (debe dar exit 0).
  - Frontend: `cd pichanga360-web && npx tsc --noEmit` y `npx eslint <archivos>`.
- Hay **1 error de lint pre-existente** en `(dashboard)/reservas/page.tsx:117`
  (`react-hooks/set-state-in-effect`, en el efecto que auto-selecciona la primera
  cancha). No es nuestro; no lo arregles salvo que se pida.
- No agregues caché offline a la PWA sin acordarlo.

---

## Estado actual — qué ya se hizo (2026-05-28)

### Análisis completo del sistema
Backend (30+ módulos) y frontend revisados. El flujo del dueño para guardar
reservas ya es maduro: `ReservaForm` con pasos numerados, cliente walk-in
(con búsqueda por DNI/RENIEC), detección de conflictos en vivo, pago opcional,
y `DetalleReservaModal` con transiciones de estado, edición, cancelación, gestión
de pagos y QR.

### Pulido del flujo del dueño (HECHO)
1. **Calendario — bloques continuos.** Antes una reserva multi-hora se pintaba
   repetida en cada fila de hora. Ahora es **un solo bloque** (`rowSpan`) con
   nombre + rango horario + estado. → `src/components/reservas/CalendarioSemanal.tsx`
2. **Botón de WhatsApp al cliente** en el detalle de reserva, con mensaje
   pre-cargado. → `src/components/reservas/DetalleReservaModal.tsx` +
   `buildWhatsAppLink` en `src/lib/utils.ts`.

### Feature A — Reservas fijas / recurrentes (HECHO)
Pestaña **"Fijas"** dentro de `/reservas` (no intrusiva; el flujo diario quedó
intacto). El dueño crea una reserva que se repite cada semana para un cliente
habitual ("el equipo de los martes 8pm"); se generan las reservas
automáticamente.
- Backend (aditivo, sin romper el flujo del cliente):
  - `CreateReservaRecurrenteDto` acepta `clienteId?`.
  - `reservas-recurrentes.service.ts`: `create` resuelve el cliente con permiso
    de operador; `generar` crea las reservas a nombre del cliente y CONFIRMADAS
    cuando las arma el operador; nuevo `findByLocal(user, localId)`.
  - `reservas-recurrentes.controller.ts`: nuevo `GET /reservas-recurrentes/local/:localId`.
- Frontend:
  - `src/hooks/reservas/useReservasRecurrentes.ts`
  - `src/components/reservas/ReservaFijaForm.tsx`
  - `src/components/reservas/ReservasFijasPanel.tsx` (lista + estado vacío como
    oportunidad: "Convierte clientes en ingresos seguros")
  - `src/app/(dashboard)/reservas/page.tsx` (tab "Fijas")
  - `src/types/index.ts` (`ReservaRecurrente` extendido + `GenerarRecurrenteResult`)
- Detalle conocido: la fija no valida al crearse si el día/hora cae dentro del
  horario operativo de la cancha; si cae fuera, genera 0 reservas y el toast lo
  reporta ("0 creadas · N omitidas"). Mejora opcional pendiente.

---

## ✅ PASO B — HECHO (2026-05-29)

Lado público alineado con la dirección de producto: el externo **solo ve
canchas + horarios + contacto**, y **ya no auto-reserva**.
- **B.1 backend:** `canchas.service.ts → findOne` ahora expone dirección
  completa del local + `telefonos` (codigoPais, numero, tipo).
- **B.2 frontend:** `(public)/cancha/[id]/page.tsx` sin auto-reserva (se quitó
  `ReservaForm`/modal/"Reservar ahora"); horarios quedan informativos; botón
  **Contactar por WhatsApp** (prefiere tipo WHATSAPP → PRINCIPAL) + **Llamar**
  (`tel:`). `CanchaCard` dice "Ver cancha →".
- **Ocultar registro de cliente:** los CTA de dueño (Navbar, Footer,
  CanchasDestacadas) apuntaban por error a `/registro` (jugador); se
  repuntaron a `/registro-empresa`. No se borró `/registro` ni `ReservaForm`.

## ✅ Mejoras operativas del dueño (2026-05-29)

- **Fix dashboard:** "Ingresos del mes" ahora suma solo pagos `PAGADO` (antes
  contaba PENDIENTE y DEVUELTO). Ocupación usa horas reservadas reales vs
  `canchas × 14h`. → `(dashboard)/dashboard/page.tsx`.
- **Caja del día (C nuevo):** `(dashboard)/caja/page.tsx` — cobrado del día con
  desglose por método (Efectivo/Yape/Plin/Transferencia), por cobrar y devuelto,
  con selector de fecha. Reutiliza `useReservas`; sin endpoint nuevo. Pendiente:
  arqueo (apertura/cierre) y egresos.
- **Lista de espera (C):** `(dashboard)/lista-espera/page.tsx` + hook
  `useListaEspera.ts` — ver cola por cancha, **agregar cliente** (form
  `ListaEsperaForm` con `ClienteSelectorReserva`), contactar por WhatsApp y
  quitar. El backend `lista-espera.create` ahora acepta `clienteId` opcional con
  permiso de operador (`assertPuedeOperarLocal`, igual que recurrentes); si se
  omite, usa `user.sub`. Pendiente: auto-aviso al primero de la cola cuando se
  cancela una reserva (hoy es manual).
- **Recordatorios push al dueño:** `modules/recordatorios/` (cron con
  `@nestjs/schedule`, ya instalado + `ScheduleModule.forRoot()`): resumen 20:00
  Perú de reservas de mañana + nudge 2h antes, vía `WebPushService.sendToLocalOperators`.
  No probado en runtime (requiere DB + VAPID keys). **NO** llega al cliente
  externo: WhatsApp no se auto-envía (solo arma `wa.me`) y los clientes no tienen
  token push. Auto-envío real al cliente necesitaría WhatsApp Business API.
- **Sidebar:** Dashboard, **Caja del día** y **Lista de espera** son enlaces
  fijos (hardcoded) en la sección "General"; el resto del menú sigue siendo
  dinámico desde `/modulos/disponibles`.

## ✅ Hardening para producción (2026-05-29)

Auditoría de producción (seguridad multi-tenant, correctitud, onboarding) +
correcciones. Hecho:
- **Aislamiento multi-tenant (fuga de datos entre empresas):** se agregó
  validación de ownership del local (`assertPuedeOperarLocal` / criterio
  cliente-dueño) en `pagos-reserva`, `pedidos-snack`, `ventas-snack`,
  `lista-espera` (findByCancha/remove), `notificaciones` (whatsapp) y
  `reservas.findByQr` (ahora pide `user` + `assertViewAccess`). **`usuarios.findAll`**
  ahora filtra "clientes" por la empresa/local del usuario (relación
  `reservasComoCliente`) — antes devolvía TODOS los usuarios del sistema.
- **Anti doble-reserva (race condition):** `reservas.create` y `update` ahora
  toman un `pg_advisory_xact_lock(hashtextextended(canchaId,0))` y revalidan el
  solapamiento DENTRO de la transacción (`validarHorarioYOverlap` recibe el `tx`;
  filtra `deletedAt: null` explícito).
- **Precio S/0:** `ReservaForm` distingue "sin tarifa" de "tarifa 0 válida";
  muestra banner de advertencia y exige confirmación explícita o monto manual
  (no bloquea el caso legítimo).
- **Cuenta/contraseña:** nueva página `(dashboard)/cuenta` + `CambiarPasswordForm`
  + hook `useCambiarPassword` (POST /auth/change-password con campos
  `passwordActual`/`passwordNueva`; el backend revoca sesiones → cierra sesión
  tras cambiar). Sidebar: "Configuración" → `/empresas/me`, "Soporte" → mailto.
  UserMenu: "Mi cuenta" → `/cuenta`.
- Verificado: backend `tsc` 0, frontend `tsc` 0, eslint sin errores. NO probado
  en runtime (sin BD).

## ✅ Features operativos del dueño (2026-05-29)

⚠️ **REQUIERE MIGRACIÓN DE BD**: se agregó el enum `NO_SHOW` a `EstadoReserva` y
los modelos `CajaSesion` + `EgresoCaja` (+ `EstadoCajaSesion`) en
`schema.prisma`. Se corrió `prisma generate` (el código compila), pero **hay que
correr `npx prisma migrate dev` en el servidor** para crear las tablas/enum.

- **#1 Staff/operadores:** el dueño (ADMIN_EMPRESA) crea empleados con
  email+password y rol (OPERADOR/ADMIN_LOCAL) scoped a un local. Backend:
  `POST /usuarios/operador` + `GET /usuarios/staff` (usuarios.service/controller).
  Frontend: página `/equipo` + `useStaff.ts` + `components/equipo/*` + tipos en
  `src/types/staff.ts`. Enlace fijo "Equipo" en el sidebar.
- **#2 Arqueo de caja + egresos:** módulo `src/modules/caja/` (abrir/cerrar
  sesión, egresos, resumen) con ownership. Frontend: `/caja` extendido con
  apertura, cierre con arqueo (efectivo esperado = inicial + cobrado efectivo −
  egresos efectivo vs contado) y egresos; `hooks/caja/useCaja.ts` +
  `components/caja/*`. Tipos `CajaSesion`/`EgresoCaja` al final de `types/index.ts`.
- **#3 No-show:** estado `NO_SHOW` (terminal, alcanzable desde CONFIRMADA/EN_CURSO).
  Backend: TRANSICIONES + `cancelar`. Frontend: botón "Marcar como no asistió" en
  `DetalleReservaModal`, badge/tab/calendario, y excluido de ingresos/ocupación en
  dashboard, reportes y caja.
- Verificado: backend `tsc` 0, frontend `tsc` 0, eslint sin errores. NO probado en
  runtime (falta la migración + BD).

**Pendientes de producción aún abiertos:** recordatorio automático real al
cliente (WhatsApp Business API), auto-aviso a lista de espera al cancelar,
buscar/filtrar reservas, y (opcional, robustez doble-reserva) constraint de
exclusión Postgres btree_gist. Cron de marcado automático de NO_SHOW (si pasó la
hora y no hubo check-in) queda como mejora.

## 👉 PASO B (histórico — referencia del plan original)

**Objetivo:** alinear el lado público con la dirección de producto — el externo
**solo ve canchas + horarios + contacto**, y **no auto-reserva**. La opción
elegida fue: **"Desactivar la auto-reserva y poner contacto"**.

### B.1 — Backend: exponer teléfono + dirección del local en el endpoint público
El endpoint público `GET /canchas/:id` (`canchas.service.ts → findOne`) hoy solo
devuelve `local: { id, nombre, empresaId }`. Problemas:
- La página pública (`(public)/cancha/[id]/page.tsx`) ya intenta mostrar
  `cancha.local.calle / numero / distrito / provincia` → **llegan `undefined`**.
- No hay ningún teléfono para el botón de contacto.

**Hacer:** extender el `select` del `local` en `findOne` (y en `findByLocal` si
aplica para `/buscar`) para incluir:
- Dirección: `calle, numero, distrito, provincia, departamento` (y `latitud/longitud` si el mapa los usa).
- Teléfonos: `telefonos` (modelo `TelefonoLocal`: `codigoPais, numero, tipo`).
  El tipo puede ser `PRINCIPAL | WHATSAPP | REFERENCIA`. Para el botón de WhatsApp,
  preferir el de tipo `WHATSAPP`; si no hay, caer a `PRINCIPAL`.
- Actualizar el tipo `Cancha`/`Local` en `src/types/index.ts` del frontend.
- Verificar con `tsc --noEmit` en backend.

### B.2 — Frontend: quitar la auto-reserva del lado público y poner contacto
Archivo principal: `pichanga360-web/src/app/(public)/cancha/[id]/page.tsx`
- **Quitar/ocultar** el flujo de auto-reserva del cliente:
  - Botón **"Reservar ahora"** y los slots de horario clicables que abren el
    `ReservaForm` (función `abrirReserva` + `<Modal>` con `<ReservaForm>`).
  - Mantener la **vista** de horarios disponibles como **informativa** (mostrar
    qué horas están libres/ocupadas, pero sin acción de reservar).
- **Cablear el botón "Contactar al dueño"** (hoy está MUERTO, sin `onClick`):
  - Usar `buildWhatsAppLink(telefono, mensaje)` con el teléfono WhatsApp del local
    y un mensaje tipo: `"Hola, vi la cancha {nombre} en Pichanga360 y quiero
    consultar disponibilidad."`. Abrir en `target="_blank"`.
  - Añadir también opción de **llamar** (`tel:`) como alternativa.
  - Mostrar el número visible (no solo el botón).
- Revisar OTRAS superficies públicas con CTAs de "Reservar" y aplicar el mismo
  criterio (mostrar contacto en vez de reservar):
  - `(public)/buscar/page.tsx`, `components/public/ResultCard.tsx`,
    `components/public/CanchaCard.tsx`, `components/public/HeroSearch.tsx`,
    `(public)/page.tsx` (landing).
- Decidir qué hacer con el **registro/login de cliente** (`(public)/registro`,
  `(public)/login`): por ahora el externo no necesita cuenta para mirar+contactar.
  No es urgente borrarlo; basta con que las canchas no empujen al flujo de
  reserva. (Confirmar con el usuario si quiere ocultar el registro de cliente.)
- Verificar con `tsc --noEmit` + `eslint`.

### B.3 — Nota
La opción que el dueño eligió fue **desactivar** (no solo ocultar tras flag). Aun
así, conviene no borrar el `ReservaForm` ni los hooks de cliente — solo desconectar
los puntos de entrada públicos — para poder reactivar el marketplace más adelante
sin rehacer todo.

---

## Backlog posterior (después de B)

- **C — UI de Lista de Espera**: el backend tiene módulo `lista-espera` completo,
  sin UI en el frontend. Permite cubrir huecos cuando se cancela una reserva.
- Enlaces muertos del sidebar: **"Configuración"** y **"Soporte"** (`href="#"`)
  en `src/components/dashboard/Sidebar.tsx`.
- Validar horario operativo al crear una reserva fija (ver "Detalle conocido").
- Revisar la fórmula de "ocupación estimada" del dashboard (hoy es aproximada:
  `canchas × 12h`).

---

## Comandos útiles

```bash
# Backend
cd pichanga360-backend
npx tsc --noEmit          # typecheck
npm run start:dev         # dev (requiere DATABASE_URL)
npx prisma generate

# Frontend
cd pichanga360-web
npx tsc --noEmit          # typecheck
npx eslint <archivos>     # lint
npm run dev               # dev server
```
