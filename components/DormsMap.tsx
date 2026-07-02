'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { type Dorm } from '@/lib/helpers'
import type { AvailabilityStatus } from '@/lib/availability'
import { formatPriceLabel } from '@/lib/i18n-labels'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import { UNIVERSITIES } from '@/lib/universities'

type LatLng = { lat: number; lng: number }
type LocatedDorm = Dorm & { lat: number; lng: number }

interface Props {
  dorms: Dorm[]
  availability: Record<string, AvailabilityStatus>
  userLocation?: LatLng | null
  /** Compact mode for single-dorm previews (e.g. the dorm detail page). */
  compact?: boolean
  /** Shows small pins for Vienna's main universities. Defaults to on for the
   * full directory map, off for compact single-dorm previews. */
  showUniversities?: boolean
}

const STATUS_COLORS: Record<AvailabilityStatus['status'], string> = {
  available: '#E85D3B',
  fully_booked: '#3A322C',
  unknown: '#A79C92',
}

function dormIcon(status: AvailabilityStatus['status']) {
  const color = STATUS_COLORS[status]
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  })
}

function userIcon() {
  return L.divIcon({
    className: '',
    html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 4px rgba(37,99,235,0.25)"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function universityIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:#3A322C;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3);font-size:11px;line-height:1;">🎓</div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  })
}

/** Nudges markers that share exact coordinates (e.g. two dorms in the same
 * building) apart in a small circle so both stay individually clickable. */
function jitterOverlaps(points: { id: string; lat: number; lng: number }[]) {
  const byKey = new Map<string, string[]>()
  for (const p of points) {
    const key = `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`
    byKey.set(key, [...(byKey.get(key) ?? []), p.id])
  }
  const offsets = new Map<string, LatLng>()
  for (const ids of byKey.values()) {
    if (ids.length <= 1) continue
    ids.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / ids.length
      offsets.set(id, { lat: 0.0004 * Math.cos(angle), lng: 0.0004 * Math.sin(angle) })
    })
  }
  return offsets
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15)
      return
    }
    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lng])),
      { padding: [32, 32], maxZoom: 16 },
    )
  }, [map, points])
  return null
}

export default function DormsMap({
  dorms,
  availability,
  userLocation,
  compact = false,
  showUniversities = !compact,
}: Props) {
  const t = useTranslations('dormCard')
  const tDorms = useTranslations('dorms')
  const tLabels = useTranslations('labels')

  const located = useMemo(
    () => dorms.filter((d): d is LocatedDorm => d.lat != null && d.lng != null),
    [dorms],
  )

  const offsets = useMemo(
    () => jitterOverlaps(located.map((d) => ({ id: d.id, lat: d.lat, lng: d.lng }))),
    [located],
  )

  const points = useMemo(
    () =>
      located.map((d) => {
        const offset = offsets.get(d.id)
        return { lat: d.lat + (offset?.lat ?? 0), lng: d.lng + (offset?.lng ?? 0) }
      }),
    [located, offsets],
  )

  const boundsPoints = userLocation ? [...points, userLocation] : points

  if (located.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl bg-muted text-center ${compact ? 'h-48' : 'h-[50vh]'}`}
      >
        <p className="px-4 text-sm text-muted-foreground">{tDorms('mapNoLocations')}</p>
      </div>
    )
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-border ${compact ? 'h-56' : 'h-[60vh] md:h-[70vh]'}`}
    >
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={14}
        scrollWheelZoom={!compact}
        dragging={!compact || located.length > 1}
        zoomControl={!compact}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds points={boundsPoints} />
        {located.map((dorm, i) => {
          const status = availability[dorm.id]?.status ?? 'unknown'
          const point = points[i]
          const priceLabel = formatPriceLabel(dorm.price_min, dorm.price_max, (key, values) =>
            tLabels(key, values),
          )
          return (
            <Marker key={dorm.id} position={[point.lat, point.lng]} icon={dormIcon(status)}>
              <Popup>
                <div className="min-w-40 space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {dorm.provider}
                  </p>
                  <p className="text-sm font-medium text-foreground">{dorm.name}</p>
                  <p className="text-xs text-muted-foreground">{priceLabel}</p>
                  <AvailabilityBadge
                    availability={availability[dorm.id] ?? { status: 'unknown', label: dorm.provider }}
                    className="text-[10px]"
                  />
                  <Link
                    href={`/dorms/${dorm.slug}`}
                    className="mt-1 block text-xs font-medium text-brand hover:underline"
                  >
                    {t('viewDetails')}
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
        {showUniversities &&
          UNIVERSITIES.map((u) => (
            <Marker key={u.id} position={[u.lat, u.lng]} icon={universityIcon()}>
              <Popup>{u.name}</Popup>
            </Marker>
          ))}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon()}>
            <Popup>{tDorms('youAreHere')}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
