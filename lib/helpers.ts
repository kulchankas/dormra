import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Dorm {
  id: string
  slug: string
  provider: string
  name: string
  address: string | null
  district: number | null
  price_min: number | null
  price_max: number | null
  deposit_eur: number | null
  deposit_months: number | null
  website_url: string | null
  apply_url: string | null
  scrape_url: string | null
  scrape_type: string | null
  pets: boolean | null
  couples: boolean | null
  furnished: boolean | null
  min_stay_months: number | null
  max_stay_months: number | null
  notes: string | null
  active: boolean
  created_at: string
  image_url?: string | null
}

// ─── Availability ─────────────────────────────────────────────────────────────

export type AvailabilityStatus = {
  status: 'available' | 'fully_booked' | 'unknown'
  label: string
}

const UNKNOWN: AvailabilityStatus = { status: 'unknown', label: 'Status unknown' }
const STALE_MS = 6 * 60 * 60 * 1000 // treat snapshots older than 6 h as stale

/**
 * Fetches the most recent snapshot for each dorm in a single query and returns
 * a Map keyed by dorm_id. Missing dorm IDs map to 'unknown'.
 */
export async function getAvailabilityStatusBulk(
  dormIds: string[],
): Promise<Map<string, AvailabilityStatus>> {
  const map = new Map<string, AvailabilityStatus>()
  if (dormIds.length === 0) return map

  // Pull all snapshots for these dorms, newest first.
  // The loop below keeps only the first (= most recent) row per dorm_id.
  const { data, error } = await supabase
    .from('availability_snapshots')
    .select('dorm_id, available, scrape_ok, scraped_at')
    .in('dorm_id', dormIds)
    .order('scraped_at', { ascending: false })

  if (error || !data) return map

  const now = Date.now()
  for (const row of data) {
    if (map.has(row.dorm_id)) continue // already captured the most-recent row

    const stale = now - new Date(row.scraped_at).getTime() > STALE_MS
    if (stale || !row.scrape_ok) {
      map.set(row.dorm_id, UNKNOWN)
      continue
    }
    map.set(row.dorm_id, row.available
      ? { status: 'available', label: 'Available' }
      : { status: 'fully_booked', label: 'Fully booked' },
    )
  }

  return map
}

export function getChancesScore(provider: string): {
  label: 'Good chance' | 'Medium' | 'Competitive'
  bg: string
  color: string
} {
  const p = provider.toLowerCase()
  if (p === 'oead') {
    return { label: 'Competitive', bg: '#FCEBEB', color: '#A32D2D' }
  }
  if (p === 'home4students' || p === 'viennabase') {
    return { label: 'Medium', bg: '#FAEEDA', color: '#854F0B' }
  }
  // the-fizz, stuwo, wihast, kolpinghaus, and others
  return { label: 'Good chance', bg: '#E1F5EE', color: '#0F6E56' }
}

export function ordinalSuffix(n: number): string {
  const v = n % 100
  if (v >= 11 && v <= 13) return 'th'
  switch (v % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

export const DISTRICT_NAMES: Record<number, string> = {
  1: 'Innere Stadt', 2: 'Leopoldstadt', 3: 'Landstraße', 4: 'Wieden',
  5: 'Margareten', 6: 'Mariahilf', 7: 'Neubau', 8: 'Josefstadt',
  9: 'Alsergrund', 10: 'Favoriten', 11: 'Simmering', 12: 'Meidling',
  13: 'Hietzing', 14: 'Penzing', 15: 'Rudolfsheim-Fünfhaus', 16: 'Ottakring',
  17: 'Hernals', 18: 'Währing', 19: 'Döbling', 20: 'Brigittenau',
  21: 'Floridsdorf', 22: 'Donaustadt', 23: 'Liesing',
}
