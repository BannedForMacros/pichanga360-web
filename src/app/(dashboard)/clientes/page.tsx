'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { useDashboardMenu } from '@/components/dashboard/DashboardShell'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ClienteTable } from '@/components/clientes/ClienteTable'
import { useClientes } from '@/hooks/clientes/useClientes'

export default function ClientesPage() {
  const { open } = useDashboardMenu()
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useClientes({ page, limit })
  const total = data?.meta?.total ?? 0
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / limit))

  return (
    <>
      <Header
        title="Clientes"
        breadcrumb={[{ label: 'Operación' }, { label: 'Clientes' }]}
        onOpenMenu={open}
      />
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <ClienteTable clientes={data?.data ?? []} />
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Página {page} de {totalPages} · {total} clientes
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
