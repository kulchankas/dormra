'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTranslations } from 'next-intl'
import { Minus, Plus, Maximize2, X } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { type Dorm } from '@/lib/helpers'
import type { AvailabilityStatus } from '@/lib/availability'
import { formatPriceLabel } from '@/lib/i18n-labels'
import AvailabilityBadge from '@/components/AvailabilityBadge'
import DormImage from '@/components/DormImage'
import { UNIVERSITIES } from '@/lib/universities'
import {
  VIENNA_DISTRICTS,
  VIENNA_VIEW,
  projectVienna,
} from '@/lib/vienna-districts'
import { cn } from '@/lib/utils'

type LatLng = { lat: number; lng: number }
type LocatedDorm = Dorm & { lat: number; lng: number }

interface Props {
  dorms: Dorm[]
  availability: Record<string, AvailabilityStatus>
  userLocation?: LatLng | null
  /** Static, zoomed-in preview for a single dorm (detail page). */
  compact?: boolean
  showUniversities?: boolean
  heightClassName?: string
}

/** Dormra palette — the map is drawn, not tiled, so it inherits the brand. */
const PALETTE = {
  water: '#EDE2D6',
  district: '#FDFAF6',
  districtLine: '#DCCABB',
  districtLineStrong: '#C9B5A6',
  label: '#8A7A6E',
  hover: '#F9E8E2',
} as const

const STATUS_COLORS: Record<AvailabilityStatus['status'], string> = {
  available: '#E85D3B',
  fully_booked: '#3A322C',
  unknown: '#A79C92',
}

const RATIO = VIENNA_VIEW.height / VIENNA_VIEW.width
const MIN_VIEW_W = 55 // ~1.6 km across — deepest zoom
const MAX_VIEW_W = VIENNA_VIEW.width * 1.35

type ViewBox = { x: number; y: number; w: number }

/** District shapes with a precomputed bounding box for zoom-to-district. */
const DISTRICT_GEOMS = VIENNA_DISTRICTS.map((d) => {
  const nums = (d.path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < nums.length; i += 2) {
    if (nums[i] < minX) minX = nums[i]
    if (nums[i] > maxX) maxX = nums[i]
    if (nums[i + 1] < minY) minY = nums[i + 1]
    if (nums[i + 1] > maxY) maxY = nums[i + 1]
  }
  return { ...d, bbox: { minX, minY, maxX, maxY } }
})

/** Nudges markers that share exact coordinates (e.g. two dorms in the same
 * building) apart in a small circle so both stay individually clickable. */
function jitterOverlaps(points: { id: string; x: number; y: number }[]) {
  const byKey = new Map<string, string[]>()
  for (const p of points) {
    const key = `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    byKey.set(key, [...(byKey.get(key) ?? []), p.id])
  }
  const offsets = new Map<string, { dx: number; dy: number }>()
  for (const ids of byKey.values()) {
    if (ids.length <= 1) continue
    ids.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / ids.length
      offsets.set(id, { dx: 4 * Math.cos(angle), dy: 4 * Math.sin(angle) })
    })
  }
  return offsets
}

function clampView(v: ViewBox): ViewBox {
  const w = Math.min(Math.max(v.w, MIN_VIEW_W), MAX_VIEW_W)
  const h = w * RATIO
  const margin = w * 0.35
  const x = Math.min(Math.max(v.x, -margin), VIENNA_VIEW.width + margin - w)
  const y = Math.min(Math.max(v.y, -margin), VIENNA_VIEW.height + margin - h)
  return { x, y, w }
}

function fitView(points: { x: number; y: number }[], minW: number): ViewBox {
  if (points.length === 0) return { x: 0, y: 0, w: VIENNA_VIEW.width }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  const pad = 1.4
  const w = Math.max((maxX - minX) * pad, ((maxY - minY) * pad) / RATIO, minW)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return clampView({ x: cx - w / 2, y: cy - (w * RATIO) / 2, w })
}

export default function ViennaMap({
  dorms,
  availability,
  userLocation,
  compact = false,
  showUniversities = !compact,
  heightClassName,
}: Props) {
  const t = useTranslations('dormCard')
  const tDorms = useTranslations('dorms')
  const tLabels = useTranslations('labels')

  const located = useMemo(
    () => dorms.filter((d): d is LocatedDorm => d.lat != null && d.lng != null),
    [dorms],
  )

  const projected = useMemo(() => {
    const raw = located.map((d) => ({ id: d.id, ...projectVienna(d.lat, d.lng) }))
    const offsets = jitterOverlaps(raw)
    return raw.map((p) => {
      const o = offsets.get(p.id)
      return o ? { ...p, x: p.x + o.dx, y: p.y + o.dy } : p
    })
  }, [located])

  const userPoint = useMemo(
    () => (userLocation ? projectVienna(userLocation.lat, userLocation.lng) : null),
    [userLocation],
  )

  const dormsPerDistrict = useMemo(() => {
    const counts = new Map<number, number>()
    for (const d of located) {
      if (d.district != null) counts.set(d.district, (counts.get(d.district) ?? 0) + 1)
    }
    return counts
  }, [located])

  const fitPoints = useMemo(
    () => (userPoint ? [...projected, userPoint] : [...projected]),
    [projected, userPoint],
  )

  const initialView = useMemo(
    () => fitView(fitPoints, compact ? 200 : 320),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [view, setView] = useState<ViewBox>(initialView)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverDistrict, setHoverDistrict] = useState<number | null>(null)
  const [focusDistrict, setFocusDistrict] = useState<number | null>(null)
  const [containerSize, setContainerSize] = useState({ w: 640, h: 480 })

  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const gestureRef = useRef<{ view: ViewBox; dist: number; moved: boolean } | null>(null)

  // Re-fit whenever the visible dorm set changes (filters, "near me", …) —
  // state adjustment during render instead of an effect, per React docs.
  const fitSignature = fitPoints.map((p) => `${p.x},${p.y}`).join(';')
  const [prevSignature, setPrevSignature] = useState(fitSignature)
  if (prevSignature !== fitSignature) {
    setPrevSignature(fitSignature)
    setView(fitView(fitPoints, compact ? 200 : 320))
    setSelectedId(null)
    setFocusDistrict(null)
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Native non-passive wheel listener — React's synthetic onWheel can't
  // preventDefault, and the page would scroll while zooming.
  useEffect(() => {
    if (compact) return
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const point = toSvgPoint(svg, e.clientX, e.clientY)
      const factor = e.deltaY > 0 ? 1.25 : 0.8
      setView((v) => zoomAbout(v, point, factor))
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [compact])

  function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  function zoomAbout(v: ViewBox, point: { x: number; y: number }, factor: number): ViewBox {
    const w = Math.min(Math.max(v.w * factor, MIN_VIEW_W), MAX_VIEW_W)
    const k = w / v.w
    return clampView({
      x: point.x - (point.x - v.x) * k,
      y: point.y - (point.y - v.y) * k,
      w,
    })
  }

  function zoomCenter(factor: number) {
    setView((v) =>
      zoomAbout(v, { x: v.x + v.w / 2, y: v.y + (v.w * RATIO) / 2 }, factor),
    )
  }

  function resetView() {
    setView(fitView(fitPoints, compact ? 200 : 320))
    setFocusDistrict(null)
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (compact) return
    const svg = svgRef.current
    if (!svg) return
    svg.setPointerCapture(e.pointerId)
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pointers = [...pointersRef.current.values()]
    gestureRef.current = {
      view,
      dist:
        pointers.length === 2
          ? Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
          : 0,
      moved: false,
    }
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (compact) return
    const svg = svgRef.current
    const gesture = gestureRef.current
    if (!svg || !gesture || !pointersRef.current.has(e.pointerId)) return

    const prev = pointersRef.current.get(e.pointerId)!
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pointers = [...pointersRef.current.values()]

    if (pointers.length === 1) {
      const from = toSvgPoint(svg, prev.x, prev.y)
      const to = toSvgPoint(svg, e.clientX, e.clientY)
      if (Math.abs(e.clientX - prev.x) + Math.abs(e.clientY - prev.y) > 2) gesture.moved = true
      setView((v) => clampView({ x: v.x - (to.x - from.x), y: v.y - (to.y - from.y), w: v.w }))
    } else if (pointers.length === 2) {
      const dist = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
      if (gesture.dist > 0 && dist > 0) {
        gesture.moved = true
        const mid = toSvgPoint(
          svg,
          (pointers[0].x + pointers[1].x) / 2,
          (pointers[0].y + pointers[1].y) / 2,
        )
        setView((v) => zoomAbout(v, mid, gesture.dist / dist))
      }
      gesture.dist = dist
    }
  }

  function handlePointerUp(e: ReactPointerEvent<SVGSVGElement>) {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size === 0) {
      // A tap (no drag) on empty map closes the popup.
      if (gestureRef.current && !gestureRef.current.moved) setSelectedId(null)
      gestureRef.current = null
    }
  }

  function zoomToDistrict(district: number) {
    const geom = DISTRICT_GEOMS.find((g) => g.district === district)
    if (!geom) return
    setFocusDistrict(district)
    setView(
      fitView(
        [
          { x: geom.bbox.minX, y: geom.bbox.minY },
          { x: geom.bbox.maxX, y: geom.bbox.maxY },
        ],
        120,
      ),
    )
  }

  function handleMarkerKey(e: ReactKeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSelectedId((cur) => (cur === id ? null : id))
    }
  }

  if (located.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl bg-muted text-center',
          heightClassName ?? (compact ? 'h-48' : 'h-[50vh]'),
        )}
      >
        <p className="px-4 text-sm text-muted-foreground">{tDorms('mapNoLocations')}</p>
      </div>
    )
  }

  // Everything drawn in SVG units scales with unitsPerPx so markers, labels
  // and strokes keep a constant on-screen size at every zoom level.
  const renderedW = Math.min(containerSize.w, containerSize.h / RATIO)
  const unitsPerPx = view.w / Math.max(renderedW, 1)
  const showDistrictLabels = !compact && unitsPerPx < 0.55
  const selectedDorm = selectedId ? located.find((d) => d.id === selectedId) : null
  const focusGeom = focusDistrict != null ? DISTRICT_GEOMS.find((g) => g.district === focusDistrict) : null

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-border',
        heightClassName ?? (compact ? 'h-56' : 'h-[60vh] md:h-[70vh]'),
      )}
      style={{ background: PALETTE.water }}
    >
      <svg
        ref={svgRef}
        role="img"
        aria-label={tDorms('mapAria')}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.w * RATIO}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn('h-full w-full select-none', !compact && 'cursor-grab active:cursor-grabbing')}
        style={!compact ? { touchAction: 'none' } : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* District shapes, tinted by how many listed dorms they contain */}
        <g>
          {DISTRICT_GEOMS.map((d) => {
            const count = dormsPerDistrict.get(d.district) ?? 0
            const isHover = hoverDistrict === d.district
            const isFocus = focusDistrict === d.district
            const density = count > 0 ? Math.min(0.06 + count * 0.045, 0.28) : 0
            return (
              <path
                key={d.district}
                d={d.path}
                fill={
                  isHover || isFocus
                    ? PALETTE.hover
                    : density > 0
                      ? `rgba(232, 93, 59, ${density})`
                      : PALETTE.district
                }
                stroke={isHover || isFocus ? PALETTE.districtLineStrong : PALETTE.districtLine}
                strokeWidth={(isHover || isFocus ? 1.6 : 1) * unitsPerPx}
                strokeLinejoin="round"
                className={compact ? undefined : 'cursor-pointer transition-[fill] duration-150'}
                onPointerEnter={compact ? undefined : () => setHoverDistrict(d.district)}
                onPointerLeave={compact ? undefined : () => setHoverDistrict(null)}
                onClick={compact ? undefined : () => zoomToDistrict(d.district)}
              >
                <title>{`${d.district}. ${d.name}`}</title>
              </path>
            )
          })}
        </g>

        {/* District number labels appear once zoomed in enough to read them */}
        {showDistrictLabels && (
          <g aria-hidden="true" pointerEvents="none">
            {DISTRICT_GEOMS.map((d) => (
              <text
                key={d.district}
                x={d.cx}
                y={d.cy}
                textAnchor="middle"
                fill={PALETTE.label}
                fontSize={10 * unitsPerPx}
                fontWeight={600}
              >
                {d.district}
              </text>
            ))}
          </g>
        )}

        {/* Universities */}
        {showUniversities &&
          UNIVERSITIES.map((u) => {
            const p = projectVienna(u.lat, u.lng)
            const s = 9 * unitsPerPx
            return (
              <g key={u.id} transform={`translate(${p.x} ${p.y})`}>
                <rect
                  x={-s}
                  y={-s}
                  width={s * 2}
                  height={s * 2}
                  rx={s * 0.35}
                  fill="#3A322C"
                  stroke="#FFFFFF"
                  strokeWidth={1.5 * unitsPerPx}
                />
                {/* Graduation cap (lucide GraduationCap outline) */}
                <g
                  transform={`translate(${-s * 0.72} ${-s * 0.72}) scale(${(s * 1.44) / 24})`}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                  <path d="M22 10v6" />
                  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
                </g>
                <title>{u.name}</title>
              </g>
            )
          })}

        {/* Dorm markers */}
        {located.map((dorm, i) => {
          const status = availability[dorm.id]?.status ?? 'unknown'
          const p = projected[i]
          const r = 7 * unitsPerPx
          const isSelected = selectedId === dorm.id
          return (
            <g
              key={dorm.id}
              transform={`translate(${p.x} ${p.y})`}
              role="button"
              tabIndex={compact ? -1 : 0}
              aria-label={dorm.name}
              className={compact ? undefined : 'cursor-pointer focus:outline-none'}
              onClick={(e) => {
                e.stopPropagation()
                if (!compact) setSelectedId((cur) => (cur === dorm.id ? null : dorm.id))
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => !compact && handleMarkerKey(e, dorm.id)}
            >
              {status === 'available' && (
                <circle
                  r={r * 1.5}
                  fill={STATUS_COLORS.available}
                  opacity={0.25}
                  className="motion-safe:animate-ping"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              )}
              {isSelected && (
                <circle r={r * 1.9} fill="none" stroke={STATUS_COLORS[status]} strokeWidth={1.5 * unitsPerPx} opacity={0.6} />
              )}
              <circle
                r={r}
                fill={STATUS_COLORS[status]}
                stroke="#FFFFFF"
                strokeWidth={2 * unitsPerPx}
                style={{ filter: 'drop-shadow(0 1px 2px rgba(26,20,16,0.35))' }}
              />
            </g>
          )
        })}

        {/* User location */}
        {userPoint && (
          <g transform={`translate(${userPoint.x} ${userPoint.y})`} pointerEvents="none">
            <circle r={11 * unitsPerPx} fill="rgba(37,99,235,0.2)" />
            <circle r={5.5 * unitsPerPx} fill="#2563EB" stroke="#FFFFFF" strokeWidth={2 * unitsPerPx} />
            <title>{tDorms('youAreHere')}</title>
          </g>
        )}
      </svg>

      {/* Zoom controls */}
      {!compact && (
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {(
            [
              { icon: Plus, label: tDorms('mapZoomIn'), action: () => zoomCenter(0.7) },
              { icon: Minus, label: tDorms('mapZoomOut'), action: () => zoomCenter(1.45) },
              { icon: Maximize2, label: tDorms('mapResetView'), action: resetView },
            ] as const
          ).map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              aria-label={label}
              className="grid size-8 place-items-center rounded-lg border border-border bg-surface/95 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {/* Focused-district chip */}
      {!compact && focusGeom && (
        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface/95 py-1.5 pl-3.5 pr-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
          {focusGeom.district}. {focusGeom.name}
          <span className="text-muted-foreground">
            {(dormsPerDistrict.get(focusGeom.district) ?? 0) === 1
              ? tDorms('mapDistrictCount', { count: 1 })
              : tDorms('mapDistrictCountPlural', { count: dormsPerDistrict.get(focusGeom.district) ?? 0 })}
          </span>
          <button
            type="button"
            onClick={resetView}
            aria-label={tDorms('mapResetView')}
            className="grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Selected dorm card */}
      {selectedDorm && (
        <div className="absolute inset-x-3 bottom-3 z-10 mx-auto max-w-sm">
          <div className="card-elevated flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/95 p-2.5 backdrop-blur-sm">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-brand-soft">
              {selectedDorm.image_url ? (
                <DormImage
                  src={selectedDorm.image_url}
                  alt=""
                  sizes="64px"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-lg opacity-40">🏠</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {selectedDorm.provider}
              </p>
              <p className="truncate text-sm font-medium text-foreground">{selectedDorm.name}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {formatPriceLabel(selectedDorm.price_min, selectedDorm.price_max, (key, values) =>
                    tLabels(key, values),
                  )}
                </span>
                <AvailabilityBadge
                  availability={
                    availability[selectedDorm.id] ?? { status: 'unknown', label: selectedDorm.provider }
                  }
                  className="px-2 text-[9px]"
                />
              </div>
              <Link
                href={`/dorms/${selectedDorm.slug}`}
                className="mt-0.5 inline-block text-xs font-medium text-brand hover:underline"
              >
                {t('viewDetails')}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label={tDorms('mapClosePopup')}
              className="grid size-7 shrink-0 place-items-center self-start rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Boundary data attribution (CC BY 4.0) */}
      <p className="pointer-events-none absolute bottom-1 right-2 text-[9px] text-muted-foreground/70">
        © Stadt Wien · data.wien.gv.at · CC BY 4.0
      </p>
    </div>
  )
}
