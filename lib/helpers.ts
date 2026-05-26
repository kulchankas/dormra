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

export async function getAvailabilityStatusBulk(
  dormIds: string[],
): Promise<Map<string, AvailabilityStatus>> {
  const map = new Map<string, AvailabilityStatus>()
  if (dormIds.length === 0) return map

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  type SnapshotRow = { dorm_id: string; available: boolean; scrape_ok: boolean; scraped_at: string }
  const { data, error } = (await db
    .from('availability_snapshots')
    .select('dorm_id, available, scrape_ok, scraped_at')
    .in('dorm_id', dormIds)
    .order('scraped_at', { ascending: false })) as { data: SnapshotRow[] | null; error: unknown }

  if (error || !data) return map

  const now = Date.now()
  for (const row of data) {
    if (map.has(row.dorm_id)) continue

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

// ─── Chances rating ───────────────────────────────────────────────────────────

export type ChancesRating = {
  emoji: string
  label: 'Good chance' | 'Medium' | 'Competitive'
  /** Inline color for the badge text. */
  color: string
  /** Inline color for the badge background. */
  bg: string
  /** Plain-English context, shown in a tooltip. */
  tooltip: string
}

export function getChancesScore(provider: string): ChancesRating {
  const p = provider.toLowerCase()
  if (p === 'oead') {
    return {
      emoji: '🔴',
      label: 'Competitive',
      color: '#991B1B',
      bg: '#FEE2E2',
      tooltip: 'OeAD housing is heavily oversubscribed — prioritised by study type and programme.',
    }
  }
  if (p === 'home4students' || p === 'viennabase') {
    return {
      emoji: '🟡',
      label: 'Medium',
      color: '#92400E',
      bg: '#FEF3C7',
      tooltip: 'Moderate competition. Apply early and have a backup option ready.',
    }
  }
  return {
    emoji: '🟢',
    label: 'Good chance',
    color: '#14532D',
    bg: '#DCFCE7',
    tooltip: 'Places are usually available — good odds if you apply promptly.',
  }
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

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

export function formatDistrictLabel(district: number | null): string | null {
  if (!district) return null
  const name = DISTRICT_NAMES[district]
  return `${district}${ordinalSuffix(district)} district${name ? ` · ${name}` : ''}`
}

export function formatPriceLabel(min: number | null, max: number | null): string {
  if (min && max) return `€${min}–${max} / month`
  if (min) return `From €${min} / month`
  return 'Price on request'
}
