import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { LocalActualProvider } from '@/contexts/LocalActualContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LocalActualProvider>
      <DashboardShell>{children}</DashboardShell>
    </LocalActualProvider>
  )
}
