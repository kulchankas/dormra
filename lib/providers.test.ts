import { describe, expect, it } from 'vitest'
import {
  HERO_TRACKED_PROVIDERS,
  LIVE_SCRAPER_COUNT,
  PROVIDER_ORGANIZATIONS,
  PROVIDER_WEBSITES,
  VIENNA_PROVIDERS,
} from './providers'

describe('providers', () => {
  it('tracks 11 organizations and 8 websites', () => {
    expect(VIENNA_PROVIDERS).toHaveLength(PROVIDER_ORGANIZATIONS)
    expect(PROVIDER_ORGANIZATIONS).toBe(11)
    expect(PROVIDER_WEBSITES).toBe(8)
  })

  it('has three live scrapers', () => {
    expect(LIVE_SCRAPER_COUNT).toBe(3)
    expect(VIENNA_PROVIDERS.filter((p) => p.live)).toHaveLength(3)
  })

  it('hero row is a subset of all providers', () => {
    const all = new Set(VIENNA_PROVIDERS.map((p) => p.name))
    for (const p of HERO_TRACKED_PROVIDERS) {
      expect(all.has(p.name)).toBe(true)
    }
  })
})
