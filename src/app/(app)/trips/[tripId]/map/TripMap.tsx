'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Stop {
  id: string
  name: string
  lat: number
  lng: number
  category: string
  time_label: string | null
  description: string | null
}

interface PhotoPin {
  id: string
  url: string
  lat: number
  lng: number
  caption: string | null
}

interface Props {
  stops: Stop[]
  tripName: string
  photos?: PhotoPin[]
}

const CATEGORY_COLORS: Record<string, string> = {
  hotel: '#7c3aed',
  restaurant: '#ea580c',
  waterfall: '#0891b2',
  cave: '#4b5563',
  viewpoint: '#16a34a',
  temple: '#d97706',
  adventure: '#dc2626',
  river: '#0284c7',
  village: '#65a30d',
  transport: '#2563eb',
  default: '#1a4731',
}

export default function TripMap({ stops, tripName, photos = [] }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [selected, setSelected] = useState<Stop | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoPin | null>(null)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const validStops = stops.filter(s => s.lat && s.lng)
    const validPhotos = photos.filter(p => p.lat && p.lng)

    // Center on stops or default to Shillong
    const center: [number, number] = validStops.length > 0
      ? [validStops[0].lng, validStops[0].lat]
      : [91.7362, 25.5788]

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }],
      } as any,
      center,
      zoom: 11,
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.current.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')

    validStops.forEach((stop, i) => {
      const color = CATEGORY_COLORS[stop.category] || CATEGORY_COLORS.default

      const el = document.createElement('div')
      el.className = 'cursor-pointer'
      el.innerHTML = `
        <div style="background:${color};color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
          ${i + 1}
        </div>
      `
      el.addEventListener('click', () => setSelected(stop))

      new maplibregl.Marker({ element: el })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map.current!)
    })

    // Photo pins — camera emoji markers
    validPhotos.forEach(photo => {
      const el = document.createElement('div')
      el.className = 'cursor-pointer'
      el.innerHTML = `
        <div style="background:#e11d48;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
          📷
        </div>
      `
      el.addEventListener('click', () => { setSelectedPhoto(photo); setSelected(null) })
      new maplibregl.Marker({ element: el })
        .setLngLat([photo.lng, photo.lat])
        .addTo(map.current!)
    })

    // Fit bounds to all stops
    if (validStops.length > 1) {
      const bounds = new maplibregl.LngLatBounds()
      validStops.forEach(s => bounds.extend([s.lng, s.lat]))
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 13 })
    }

    return () => { map.current?.remove(); map.current = null }
  }, [stops, photos])

  return (
    <div className="relative h-[calc(100vh-180px)] rounded-2xl overflow-hidden border border-gray-200">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Stop panel */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{selected.name}</h3>
              {selected.time_label && <p className="text-xs text-gray-500 mt-0.5">🕐 {selected.time_label}</p>}
              {selected.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selected.description}</p>}
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 text-lg leading-none ml-2">✕</button>
          </div>
          <a
            href={`https://maps.google.com/?q=${selected.lat},${selected.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm py-2 rounded-xl font-medium"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {/* Photo panel */}
      {selectedPhoto && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="relative">
            <img src={selectedPhoto.url} alt="" className="w-full h-40 object-cover" />
            <button onClick={() => setSelectedPhoto(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">✕</button>
          </div>
          {selectedPhoto.caption && <p className="px-4 py-2 text-sm text-gray-700">{selectedPhoto.caption}</p>}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur rounded-xl px-2.5 py-1.5 text-xs text-gray-600 shadow flex gap-2">
        <span>🔵 Stop</span>
        <span>📷 Photo</span>
      </div>
    </div>
  )
}
