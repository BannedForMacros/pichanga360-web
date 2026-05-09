import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { DashboardGuard } from '@/components/dashboard/DashboardGuard'
import { LocalActualProvider } from '@/contexts/LocalActualContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LocalActualProvider>
      <DashboardGuard>
        <DashboardShell>{children}</DashboardShell>
      </DashboardGuard>
    </LocalActualProvider>
  )
}
