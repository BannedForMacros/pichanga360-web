'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            background: '#0D1B2A',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(13, 27, 42, 0.3)',
          },
          success: {
            iconTheme: { primary: '#00A86B', secondary: '#fff' },
            style: { background: '#0D1B2A', color: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { background: '#0D1B2A', color: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
