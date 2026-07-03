import { describe, expect, it } from 'vitest'
import { UNIVERSITIES, nearestUniversities } from './universities'

describe('UNIVERSITIES', () => {
  it('has 5 known universities with plausible Vienna coordinates', () => {
    expect(UNIVERSITIES).toHaveLength(5)
    for (const u of UNIVERSITIES) {
      expect(u.lat).toBeGreaterThan(48)
      expect(u.lat).toBeLessThan(48.4)
      expect(u.lng).toBeGreaterThan(16)
      expect(u.lng).toBeLessThan(16.6)
    }
  })
})

describe('nearestUniversities', () => {
  it('sorts by distance, nearest first', () => {
    // Point very close to TU Wien's coordinates.
    const point = { lat: 48.199, lng: 16.3701 }
    const result = nearestUniversities(point)
    expect(result[0].id).toBe('tu')
    for (let i = 1; i < result.length; i++) {
      expect(result[i].km).toBeGreaterThanOrEqual(result[i - 1].km)
    }
  })

  it('respects the limit parameter', () => {
    const point = { lat: 48.2082, lng: 16.3738 }
    expect(nearestUniversities(point, 2)).toHaveLength(2)
    expect(nearestUniversities(point)).toHaveLength(5)
  })
})
