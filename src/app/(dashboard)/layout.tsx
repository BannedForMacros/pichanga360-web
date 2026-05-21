import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { DashboardGuard } from '@/components/dashboard/DashboardGuard'
import { PushBanner } from '@/components/push/PushBanner'
import { LocalActualProvider } from '@/contexts/LocalActualContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LocalActualProvider>
      <DashboardGuard>
        <DashboardShell>
          <PushBanner />
          {children}
        </DashboardShell>
      </DashboardGuard>
    </LocalActualProvider>
  )
}
