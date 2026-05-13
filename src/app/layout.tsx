import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  applicationName: 'Pichanga360',
  title: {
    default: 'Pichanga360 — Encuentra y reserva tu cancha al instante',
    template: '%s · Pichanga360',
  },
  description:
    'El marketplace deportivo del Perú. Fútbol, vóley, básquet y más en un solo lugar.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/icons/icon.svg' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Pichanga360',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1B3F72' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1B2A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // No bloqueamos el zoom — accesibilidad. PWA sigue funcionando en standalone.
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
