export type { Dorm } from './types/dorm'
export type { AvailabilityStatus } from './availability'

export type ChancesRating = {
  emoji: string
  label: string
  color: string
  bg: string
  tooltip: string
}

type ChancesTranslateFn = (
  key: 'good' | 'medium' | 'competitive' | 'oeadTooltip' | 'h4sTooltip' | 'defaultTooltip',
) => string

export function getChancesRating(provider: string, t: ChancesTranslateFn): ChancesRating {
  const p = provider.toLowerCase()
  if (p === 'oead') {
    return {
      emoji: '🔴',
      label: t('competitive'),
      color: '#991B1B',
      bg: '#FEE2E2',
      tooltip: t('oeadTooltip'),
    }
  }
  if (p === 'home4students' || p === 'viennabase') {
    return {
      emoji: '🟡',
      label: t('medium'),
      color: '#92400E',
      bg: '#FEF3C7',
      tooltip: t('h4sTooltip'),
    }
  }
  return {
    emoji: '🟢',
    label: t('good'),
    color: '#14532D',
    bg: '#DCFCE7',
    tooltip: t('defaultTooltip'),
  }
}

/** @deprecated Use getChancesRating with translations instead. */
export function getChancesScore(provider: string): ChancesRating {
  return getChancesRating(provider, (key) => {
    const fallback: Record<Parameters<ChancesTranslateFn>[0], string> = {
      good: 'Good chance',
      medium: 'Medium',
      competitive: 'Competitive',
      oeadTooltip: 'OeAD housing is heavily oversubscribed — prioritised by study type and programme.',
      h4sTooltip: 'Moderate competition. Apply early and have a backup option ready.',
      defaultTooltip: 'Places are usually available — good odds if you apply promptly.',
    }
    return fallback[key]
  })
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
