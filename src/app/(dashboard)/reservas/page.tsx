'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, Repeat, Search, Table } from 'lucide-react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { ReservaForm } from '@/components/reservas/ReservaForm'
import { TablaReservas } from '@/components/reservas/TablaReservas'
import { CalendarioSemanal } from '@/components/reservas/CalendarioSemanal'
import { ReservasFijasPanel } from '@/components/reservas/ReservasFijasPanel'
import { DetalleReservaModal } from '@/components/reservas/DetalleReservaModal'
import { MisReservasList } from '@/components/reservas/MisReservasList'
import { useReservas } from '@/hooks/reservas/useReservas'
import { useCanchasByLocal } from '@/hooks/canchas/useCanchas'
import { useLocalActual } from '@/hooks/auth/useLocalActual'
import { useUsuarioActual } from '@/hooks/auth/useAuth'
import { cn, formatDate } from '@/lib/utils'
import type { Reserva } from '@/types'

type Vista = 'calendario' | 'tabla' | 'fijas'

export default function ReservasPage() {
  const router = useRouter()
  const { open: openMenu } = useDashboardMenu()
  const { localId, isLoading: loadingLocal } = useLocalActual()
  const { data: me } = useUsuarioActual()

  const esClientePuro =
    !!me?.roles?.length && me.roles.every((r) => r.rol === 'CLIENTE')

  const { data: reservasResp, isLoading } = useReservas({
    localId: esClientePuro ? undefined : localId ?? undefined,
    limit: 50,
  })
  const { data: canchas } = useCanchasByLocal(
    esClientePuro ? undefined : localId ?? undefined,
  )

  // ============== VISTA CLIENTE ==============
  if (esClientePuro) {
    return (
      <>
        <Header
          title="Mis reservas"
          breadcrumb={[{ label: 'Cliente' }, { label: 'Mis reservas' }]}
          onOpenMenu={openMenu}
        />
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              Aquí ves todas tus reservas activas, pasadas y canceladas.
            </p>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Search size={14} />}
              onClick={() => router.push('/buscar')}
            >
              Buscar canchas
            </Button>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <MisReservasList reservas={reservasResp?.data ?? []} />
          )}
        </div>
      </>
    )
  }

  // ============== VISTA DUEÑO / OPERADOR ==============
  return (
    <DueñoView
      canchas={canchas ?? []}
      reservas={reservasResp?.data ?? []}
      localId={localId ?? undefined}
      isLoading={loadingLocal || isLoading}
      onOpenMenu={openMenu}
    />
  )
}

interface DueñoViewProps {
  canchas: { id: string; nombre: string }[]
  reservas: Reserva[]
  localId?: string
  isLoading: boolean
  onOpenMenu: () => void
}

function DueñoView({ canchas, reservas, localId, isLoading, onOpenMenu }: DueñoViewProps) {
  const [vista, setVista] = useState<Vista>('calendario')
  const [open, setOpen] = useState(false)
  const [canchaCalendario, setCanchaCalendario] = useState<string | undefined>()
  const [defaultFecha, setDefaultFecha] = useState<string | undefined>()
  const [defaultHora, setDefaultHora] = useState<string | undefined>()
  // Detalle de reserva al hacer click en calendario/tabla. Guardamos solo el
  // id y derivamos la reserva desde el array de reservas para que siempre
  // muestre los datos más frescos del cache de React Query.
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const reservaDetalle = useMemo(
    () => reservas.find((r) => r.id === detalleId) ?? null,
    [reservas, detalleId],
  )

  // Cuando cargan las canchas, auto-seleccionar la primera para el calendario
  useEffect(() => {
    if (canchas.length === 0) {
      setCanchaCalendario(undefined)
      return
    }
    if (
      !canchaCalendario ||
      !canchas.some((c) => c.id === canchaCalendario)
    ) {
      setCanchaCalendario(canchas[0].id)
    }
  }, [canchas, canchaCalendario])

  const onCrearDesdeCalendario = (fecha: string, hora: string) => {
    setDefaultFecha(fecha)
    setDefaultHora(hora)
    setOpen(true)
  }

  const onNuevaReserva = () => {
    setDefaultFecha(undefined)
    setDefaultHora(undefined)
    setOpen(true)
  }

  return (
    <>
      <Header
        title="Reservas"
        breadcrumb={[{ label: 'Operación' }, { label: 'Reservas' }]}
        onNew={onNuevaReserva}
        newLabel="+ Nueva reserva"
        onOpenMenu={onOpenMenu}
      />

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {/* Toggle vista */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setVista('calendario')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                vista === 'calendario'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary',
              )}
            >
              <CalendarDays size={14} /> Calendario
            </button>
            <button
              onClick={() => setVista('tabla')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                vista === 'tabla'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary',
              )}
            >
              <Table size={14} /> Tabla
            </button>
            <button
              onClick={() => setVista('fijas')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                vista === 'fijas'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-primary',
              )}
            >
              <Repeat size={14} /> Fijas
            </button>
          </div>

          {vista === 'calendario' && canchas.length > 0 && (
            <div className="w-full sm:w-72">
              <SearchableSelect
                options={canchas.map((c) => ({ label: c.nombre, value: c.id }))}
                value={canchaCalendario}
                onChange={(v) => setCanchaCalendario(v)}
                placeholder="Selecciona una cancha"
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : vista === 'calendario' ? (
          <CalendarioSemanal
            canchaId={canchaCalendario}
            onCrearReserva={onCrearDesdeCalendario}
            onClickReserva={(r) => setDetalleId(r.id)}
          />
        ) : vista === 'fijas' ? (
          <ReservasFijasPanel
            localId={localId}
            canchas={canchas}
            defaultCanchaId={canchaCalendario}
          />
        ) : (
          <TablaReservas
            reservas={reservas}
            onVerDetalle={(r) => setDetalleId(r.id)}
          />
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Nueva reserva"
        description={
          defaultFecha && defaultHora
            ? `Crearás la reserva para el ${formatDate(defaultFecha)} a las ${defaultHora}. Puedes cambiar la fecha y la hora si te equivocaste.`
            : 'Registra una reserva a nombre de un cliente. Sigue los pasos numerados de abajo.'
        }
        size="lg"
      >
        <ReservaForm
          canchas={canchas}
          defaultCanchaId={canchaCalendario}
          defaultFecha={defaultFecha}
          defaultHoraInicio={defaultHora}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </Modal>

      <DetalleReservaModal
        reserva={reservaDetalle}
        onClose={() => setDetalleId(null)}
      />
    </>
  )
}
