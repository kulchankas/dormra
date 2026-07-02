import { describe, expect, it } from 'vitest'
import { PROVIDER_STALE_MS, computeProviderStats } from './admin-provider-stats'

const NOW = new Date('2026-07-02T12:00:00Z').getTime()

const dorms = [
  { id: 'stuwo-1', provider: 'STUWO' },
  { id: 'stuwo-2', provider: 'STUWO' },
  { id: 'oead-1', provider: 'OeAD' },
  { id: 'oead-2', provider: 'OeAD' },
  { id: 'h4s-1', provider: 'home4students' },
]

describe('computeProviderStats', () => {
  it('counts dorms per provider', () => {
    const stats = computeProviderStats(dorms, [], NOW)
    const byProvider = new Map(stats.map((s) => [s.provider, s.dorms]))
    expect(byProvider.get('STUWO')).toBe(2)
    expect(byProvider.get('OeAD')).toBe(2)
    expect(byProvider.get('home4students')).toBe(1)
  })

  it('sorts providers alphabetically (locale-aware, case-insensitive)', () => {
    const stats = computeProviderStats(dorms, [], NOW)
    // "home4students" sorts before "OeAD"/"STUWO" case-insensitively (h < o < s).
    expect(stats.map((s) => s.provider)).toEqual(['home4students', 'OeAD', 'STUWO'])
  })

  it('counts scrape failures per provider', () => {
    const snapshots = [
      { dorm_id: 'stuwo-1', scrape_ok: false, scraped_at: new Date(NOW - 5 * 60 * 1000).toISOString() },
      { dorm_id: 'stuwo-2', scrape_ok: true, scraped_at: new Date(NOW - 5 * 60 * 1000).toISOString() },
      { dorm_id: 'oead-1', scrape_ok: true, scraped_at: new Date(NOW - 5 * 60 * 1000).toISOString() },
    ]
    const stats = computeProviderStats(dorms, snapshots, NOW)
    const stuwo = stats.find((s) => s.provider === 'STUWO')!
    expect(stuwo.failures).toBe(1)
  })

  it('tracks the most recent scrape attempt per provider, including failed attempts', () => {
    const snapshots = [
      { dorm_id: 'oead-1', scrape_ok: false, scraped_at: new Date(NOW - 2 * 60 * 1000).toISOString() },
      { dorm_id: 'oead-2', scrape_ok: true, scraped_at: new Date(NOW - 40 * 60 * 1000).toISOString() },
    ]
    const stats = computeProviderStats(dorms, snapshots, NOW)
    const oead = stats.find((s) => s.provider === 'OeAD')!
    expect(oead.lastScrapedAt).toBe(new Date(NOW - 2 * 60 * 1000).toISOString())
  })

  it('marks a provider stale when its most recent scrape exceeds PROVIDER_STALE_MS', () => {
    const snapshots = [
      { dorm_id: 'stuwo-1', scrape_ok: true, scraped_at: new Date(NOW - 5 * 60 * 1000).toISOString() },
      { dorm_id: 'oead-1', scrape_ok: true, scraped_at: new Date(NOW - (PROVIDER_STALE_MS + 60_000)).toISOString() },
    ]
    const stats = computeProviderStats(dorms, snapshots, NOW)
    expect(stats.find((s) => s.provider === 'STUWO')!.stale).toBe(false)
    expect(stats.find((s) => s.provider === 'OeAD')!.stale).toBe(true)
  })

  it('marks a provider stale when it has never been scraped', () => {
    const stats = computeProviderStats(dorms, [], NOW)
    expect(stats.every((s) => s.stale)).toBe(true)
    expect(stats.every((s) => s.lastScrapedAt === null)).toBe(true)
  })

  it('ignores snapshots for dorms not in the active dorm list', () => {
    const snapshots = [
      { dorm_id: 'inactive-dorm', scrape_ok: false, scraped_at: new Date(NOW).toISOString() },
    ]
    const stats = computeProviderStats(dorms, snapshots, NOW)
    expect(stats.every((s) => s.failures === 0)).toBe(true)
    expect(stats.every((s) => s.lastScrapedAt === null)).toBe(true)
  })
})
