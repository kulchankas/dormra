import { haversineDistanceKm } from './dorm-filters'

export type University = {
  id: string
  name: string
  lat: number
  lng: number
}

/** Main campus coordinates, geocoded via Nominatim/OpenStreetMap. IDs match DISTRICT_PRESETS. */
export const UNIVERSITIES: University[] = [
  { id: 'tu', name: 'TU Wien', lat: 48.1988080, lng: 16.3700568 },
  { id: 'uni', name: 'Universität Wien', lat: 48.2131278, lng: 16.3606855 },
  { id: 'wu', name: 'WU Wien', lat: 48.2138566, lng: 16.4088845 },
  { id: 'boku', name: 'BOKU', lat: 48.2365926, lng: 16.3374816 },
  { id: 'meduni', name: 'MedUni Wien', lat: 48.2194051, lng: 16.3508263 },
]

export type UniversityDistance = University & { km: number }

/** Universities sorted by distance from a point, nearest first. */
export function nearestUniversities(
  point: { lat: number; lng: number },
  limit?: number,
): UniversityDistance[] {
  const sorted = UNIVERSITIES.map((u) => ({ ...u, km: haversineDistanceKm(point, u) })).sort(
    (a, b) => a.km - b.km,
  )
  return limit ? sorted.slice(0, limit) : sorted
}
