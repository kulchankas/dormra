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

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Will later query availability_snapshots for real-time status
export function getAvailabilityStatus(_dormId: string): {
  status: 'available' | 'fully_booked' | 'unknown'
  label: string
} {
  return { status: 'unknown', label: 'Status unknown' }
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
