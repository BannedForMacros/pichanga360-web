'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/Spinner'
import type { MapPickerValue } from './MapPickerInner'

// Leaflet usa `window`/`document` durante el module init, así que el
// componente real solo puede correr en el cliente (SSR off).
const MapPickerInner = dynamic(() => import('./MapPickerInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
      <Spinner size="lg" />
    </div>
  ),
})

export type { MapPickerValue }

export function MapPicker(props: {
  value: MapPickerValue
  onChange: (next: MapPickerValue) => void
  height?: number
}) {
  return <MapPickerInner {...props} />
}
