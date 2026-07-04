/**
 * Canonical Vienna student housing sources.
 *
 * - websites: distinct booking portals students must check manually
 * - providers: housing organizations operating dorms in Vienna
 * - liveScrapers: providers with automated availability scraping in Dormra
 */

export const PROVIDER_WEBSITES = 8
export const PROVIDER_ORGANIZATIONS = 11

export type ProviderEntry = {
  name: string
  /** Has a live availability scraper in Dormra */
  live: boolean
  /** Listed on a dedicated provider website (counts toward PROVIDER_WEBSITES) */
  website: boolean
}

/** All Vienna providers Dormra tracks or plans to track (11 organizations). */
export const VIENNA_PROVIDERS: readonly ProviderEntry[] = [
  { name: 'OeAD', live: true, website: true },
  { name: 'STUWO', live: true, website: true },
  { name: 'home4students', live: true, website: true },
  { name: 'ÖJAB', live: false, website: true },
  { name: 'Akademikerhilfe', live: false, website: true },
  { name: 'WIHAST', live: false, website: true },
  { name: 'Viennabase', live: false, website: true },
  { name: 'The Fizz', live: false, website: true },
  { name: 'Milestone', live: false, website: true },
  { name: 'Youth Hostel Vienna', live: false, website: true },
  { name: 'Sparverein der Magistratsbeamten', live: false, website: true },
] as const

/** Providers shown in the hero “Tracking” row (subset with clear brand recognition). */
export const HERO_TRACKED_PROVIDERS = VIENNA_PROVIDERS.filter((p) =>
  ['OeAD', 'STUWO', 'home4students', 'ÖJAB', 'Akademikerhilfe', 'Viennabase'].includes(p.name),
)

/** Names for FAQ / copy lists. */
export const PROVIDER_NAMES = VIENNA_PROVIDERS.map((p) => p.name)

export const LIVE_SCRAPER_COUNT = VIENNA_PROVIDERS.filter((p) => p.live).length
