'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

// Servimos los PNG del marker desde /public/leaflet (los copiamos ahí en
// build / setup). Esto evita el bug clásico de Leaflet con bundlers
// modernos donde los `import url from '...png'` no se resuelven al shape
// esperado y termina lanzando "iconUrl not set in Icon options".
const defaultIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
})
L.Marker.prototype.options.icon = defaultIcon

export interface MapPickerValue {
  latitud: number
  longitud: number
  calle?: string
  numero?: string
  distrito?: string
  provincia?: string
  departamento?: string
}

interface MapPickerInnerProps {
  value: MapPickerValue
  onChange: (next: MapPickerValue) => void
  height?: number
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    road?: string
    pedestrian?: string
    footway?: string
    house_number?: string
    // Campos administrativos (de mayor a menor jerarquía):
    state?: string // departamento (Lima, Lambayeque, Cusco…)
    state_district?: string // p.ej. "Lima Metropolitana"
    region?: string // a veces provincia
    county?: string
    province?: string
    municipality?: string
    city?: string // distrito (Perú)
    city_district?: string
    town?: string
    village?: string
    // Sub-distrito / barrio (NO usar como distrito):
    suburb?: string
    neighbourhood?: string
    quarter?: string
    hamlet?: string
    country?: string
  }
}

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const DEFAULT_HEIGHT = 320

/**
 * Mapea la respuesta de Nominatim al shape MapPickerValue para PERÚ.
 *
 * Tras inspeccionar respuestas reales en Lima (San Isidro), Chiclayo y Cusco,
 * la jerarquía administrativa peruana en Nominatim es:
 *   - state           → DEPARTAMENTO (Lambayeque, Lima, Cusco…)
 *   - state_district  → PROVINCIA en Lima ("Lima Metropolitana")
 *   - region          → PROVINCIA en el resto del país (Chiclayo, Cusco…)
 *   - city            → DISTRITO (San Isidro, Chiclayo, Cuzco…)
 *   - suburb / neighbourhood / quarter → BARRIO (Condominio Colibrí, urbanizaciones)
 *
 * Por eso NO usamos `suburb` ni `neighbourhood` como distrito — eso fue el bug
 * que devolvía "Condominio Colibrí" en lugar de "Chiclayo".
 */
function fromNominatim(r: NominatimResult): MapPickerValue {
  const a = r.address ?? {}
  const departamento = a.state ?? ''
  const provincia =
    a.state_district ?? a.county ?? a.region ?? a.province ?? ''
  const distrito =
    a.city ??
    a.town ??
    a.village ??
    a.municipality ??
    a.city_district ??
    ''

  return {
    latitud: parseFloat(r.lat),
    longitud: parseFloat(r.lon),
    calle: a.road ?? a.pedestrian ?? a.footway ?? '',
    numero: a.house_number ?? '',
    distrito,
    provincia,
    departamento,
  }
}

/** Hijo del MapContainer que centra el mapa cuando cambia el valor externo */
function CenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])
  return null
}

/** Hijo del MapContainer que escucha clicks en el mapa */
function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function MapPickerInner({
  value,
  onChange,
  height = DEFAULT_HEIGHT,
}: MapPickerInnerProps) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [reverseLoading, setReverseLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lat = value.latitud
  const lng = value.longitud

  // ---- Búsqueda con debounce ----
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (search.trim().length < 3) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const url =
          `${NOMINATIM}/search?format=json&addressdetails=1&limit=6` +
          `&countrycodes=pe&q=${encodeURIComponent(search)}`
        const res = await fetch(url, { headers: { Accept: 'application/json' } })
        const data: NominatimResult[] = await res.json()
        setResults(data)
        setShowResults(true)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search])

  // ---- Reverse geocoding cuando cambia el pin ----
  const reverse = async (newLat: number, newLng: number) => {
    setReverseLoading(true)
    try {
      const url = `${NOMINATIM}/reverse?format=json&addressdetails=1&lat=${newLat}&lon=${newLng}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      const data: NominatimResult = await res.json()
      onChange(fromNominatim({ ...data, lat: String(newLat), lon: String(newLng) }))
    } catch {
      // Si falla el reverse, igual movemos el pin con las coords del click
      onChange({
        ...value,
        latitud: newLat,
        longitud: newLng,
      })
    } finally {
      setReverseLoading(false)
    }
  }

  const onPickFromResult = (r: NominatimResult) => {
    onChange(fromNominatim(r))
    setSearch(r.display_name)
    setShowResults(false)
  }

  const onUseMyLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false)
        reverse(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const direccionResumen = useMemo(() => {
    const parts = [
      value.calle && `${value.calle}${value.numero ? ' ' + value.numero : ''}`,
      value.distrito,
      value.provincia,
    ].filter(Boolean)
    return parts.join(', ')
  }, [value])

  return (
    <div className="space-y-2">
      {/* Buscador */}
      <div className="relative">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            placeholder="Busca tu dirección o lugar (ej: Av. Javier Prado 1234, San Isidro)"
            className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-10 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searching && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
            />
          )}
        </div>
        {showResults && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-[1000] mt-1 max-h-72 overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPickFromResult(r)}
                className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-primary-50"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                <span className="text-gray-700">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mapa */}
      <div
        className="relative overflow-hidden rounded-2xl border border-gray-200"
        style={{ height }}
      >
        <MapContainer
          key={`${lat},${lng}`}
          center={[lat, lng]}
          zoom={16}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CenterOnChange lat={lat} lng={lng} />
          <ClickHandler onPick={(la, ln) => reverse(la, ln)} />
          <Marker
            position={[lat, lng]}
            draggable
            icon={defaultIcon}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker
                const p = m.getLatLng()
                reverse(p.lat, p.lng)
              },
            }}
          />
        </MapContainer>

        {(reverseLoading || geoLoading) && (
          <div className="absolute right-3 top-3 z-[400] flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-700 shadow">
            <Spinner size="sm" /> Detectando dirección…
          </div>
        )}

        <button
          type="button"
          onClick={onUseMyLocation}
          disabled={geoLoading}
          className="absolute bottom-3 right-3 z-[400] inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow ring-1 ring-gray-200 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Crosshair size={12} /> Usar mi ubicación
        </button>
      </div>

      {/* Resumen detectado */}
      <div className="flex items-start gap-2 rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-700">
        <MapPin size={14} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold uppercase tracking-wide text-[10px] text-primary">
            Dirección detectada
          </p>
          <p className="truncate text-primary-700">
            {direccionResumen || 'Mueve el pin o busca una dirección'}
          </p>
        </div>
      </div>
    </div>
  )
}
