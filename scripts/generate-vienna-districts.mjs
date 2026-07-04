#!/usr/bin/env node
/**
 * Generates lib/vienna-districts.ts from the City of Vienna's official
 * district-boundary dataset (data.wien.gv.at, CC BY 4.0).
 *
 * The raw WFS polygons are extremely detailed (~2.5 MB). This script
 * projects them into a fixed SVG coordinate space, simplifies each ring
 * with Douglas-Peucker, and emits compact SVG path strings plus the
 * projection constants needed to place markers at runtime.
 *
 * Usage:
 *   node scripts/generate-vienna-districts.mjs [path-to-geojson]
 *
 * Without an argument it fetches the live dataset:
 *   https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature
 *     &version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD
 *     &srsName=EPSG:4326&outputFormat=json
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const WFS_URL =
  'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD&srsName=EPSG:4326&outputFormat=json'

const VIEW_WIDTH = 1000
const SIMPLIFY_TOLERANCE = 1.2 // SVG units — keeps shapes crisp at typical render sizes

async function loadGeoJson() {
  const arg = process.argv[2]
  if (arg) return JSON.parse(readFileSync(resolve(arg), 'utf8'))
  const res = await fetch(WFS_URL)
  if (!res.ok) throw new Error(`WFS request failed: ${res.status}`)
  return res.json()
}

/** Perpendicular distance from point p to segment a-b. */
function perpDistance(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(p[0] - a[0], p[1] - a[1])
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function douglasPeucker(points, tolerance) {
  if (points.length < 3) return points
  let maxDist = 0
  let index = 0
  const last = points.length - 1
  for (let i = 1; i < last; i++) {
    const d = perpDistance(points[i], points[0], points[last])
    if (d > maxDist) {
      maxDist = d
      index = i
    }
  }
  if (maxDist <= tolerance) return [points[0], points[last]]
  const left = douglasPeucker(points.slice(0, index + 1), tolerance)
  const right = douglasPeucker(points.slice(index), tolerance)
  return [...left.slice(0, -1), ...right]
}

function polygonCentroid(points) {
  let area = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < points.length - 1; i++) {
    const cross = points[i][0] * points[i + 1][1] - points[i + 1][0] * points[i][1]
    area += cross
    cx += (points[i][0] + points[i + 1][0]) * cross
    cy += (points[i][1] + points[i + 1][1]) * cross
  }
  area /= 2
  return [cx / (6 * area), cy / (6 * area)]
}

const geo = await loadGeoJson()
const features = geo.features
if (!features?.length) throw new Error('No features in dataset')

// Geographic bounds across all districts
let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity
for (const f of features) {
  for (const ring of f.geometry.coordinates) {
    for (const [lng, lat] of ring) {
      if (lng < minLng) minLng = lng
      if (lng > maxLng) maxLng = lng
      if (lat < minLat) minLat = lat
      if (lat > maxLat) maxLat = lat
    }
  }
}

// Equirectangular projection with latitude correction — fine at city scale.
const midLat = (minLat + maxLat) / 2
const lngScale = Math.cos((midLat * Math.PI) / 180)
const geoWidth = (maxLng - minLng) * lngScale
const geoHeight = maxLat - minLat
const scale = VIEW_WIDTH / geoWidth
const viewHeight = Math.round(geoHeight * scale)

const project = (lng, lat) => [
  (lng - minLng) * lngScale * scale,
  (maxLat - lat) * scale,
]

const districts = features
  .map((f) => {
    const beznr = f.properties.BEZNR
    const name = f.properties.NAMEK
    const rings = f.geometry.coordinates.map((ring) => {
      const projected = ring.map(([lng, lat]) => project(lng, lat))
      return douglasPeucker(projected, SIMPLIFY_TOLERANCE)
    })
    const [cx, cy] = polygonCentroid(rings[0])
    const path = rings
      .map(
        (ring) =>
          'M' +
          ring.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') +
          'Z',
      )
      .join('')
    return { district: beznr, name, path, cx: +cx.toFixed(1), cy: +cy.toFixed(1) }
  })
  .sort((a, b) => a.district - b.district)

const ts = `/**
 * Vienna district boundaries as SVG paths — GENERATED FILE, do not edit.
 * Regenerate with: node scripts/generate-vienna-districts.mjs
 *
 * Source: Stadt Wien — data.wien.gv.at (BEZIRKSGRENZEOGD), CC BY 4.0.
 * Simplified and projected into a ${VIEW_WIDTH}×${viewHeight} viewBox.
 */

export const VIENNA_VIEW = { width: ${VIEW_WIDTH}, height: ${viewHeight} } as const

/** Geographic bounds + scale used by projectVienna — must match the paths. */
export const VIENNA_PROJECTION = {
  minLng: ${minLng},
  maxLat: ${maxLat},
  lngScale: ${lngScale},
  scale: ${scale},
} as const

/** Projects WGS84 coordinates into the VIENNA_VIEW SVG coordinate space. */
export function projectVienna(lat: number, lng: number): { x: number; y: number } {
  return {
    x: (lng - VIENNA_PROJECTION.minLng) * VIENNA_PROJECTION.lngScale * VIENNA_PROJECTION.scale,
    y: (VIENNA_PROJECTION.maxLat - lat) * VIENNA_PROJECTION.scale,
  }
}

export type ViennaDistrictShape = {
  /** District number, 1–23. */
  district: number
  name: string
  /** SVG path in VIENNA_VIEW coordinates. */
  path: string
  /** Label anchor (polygon centroid) in VIENNA_VIEW coordinates. */
  cx: number
  cy: number
}

export const VIENNA_DISTRICTS: ViennaDistrictShape[] = [
${districts
  .map(
    (d) =>
      `  { district: ${d.district}, name: ${JSON.stringify(d.name)}, cx: ${d.cx}, cy: ${d.cy}, path: ${JSON.stringify(d.path)} },`,
  )
  .join('\n')}
]
`

const outPath = resolve('lib/vienna-districts.ts')
writeFileSync(outPath, ts)
const totalPoints = districts.reduce((n, d) => n + d.path.split('L').length, 0)
console.log(
  `Wrote ${outPath} — ${districts.length} districts, ~${totalPoints} points, viewBox ${VIEW_WIDTH}×${viewHeight}`,
)
