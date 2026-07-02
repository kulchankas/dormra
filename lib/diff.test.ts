import { describe, expect, it } from 'vitest'
import { isNewlyAvailableTransition } from './availability-transition'

describe('isNewlyAvailableTransition', () => {
  it('returns false when scrape failed', () => {
    expect(
      isNewlyAvailableTransition({ available: false }, { available: true, scrapeOk: false }),
    ).toBe(false)
  })

  it('returns false on first observation (no previous snapshot)', () => {
    expect(
      isNewlyAvailableTransition(null, { available: true, scrapeOk: true }),
    ).toBe(false)
  })

  it('returns true on false → true transition', () => {
    expect(
      isNewlyAvailableTransition({ available: false }, { available: true, scrapeOk: true }),
    ).toBe(true)
  })

  it('returns false when still unavailable', () => {
    expect(
      isNewlyAvailableTransition({ available: false }, { available: false, scrapeOk: true }),
    ).toBe(false)
  })

  it('returns false when still available', () => {
    expect(
      isNewlyAvailableTransition({ available: true }, { available: true, scrapeOk: true }),
    ).toBe(false)
  })

  it('returns false when availability drops (true → false)', () => {
    expect(
      isNewlyAvailableTransition({ available: true }, { available: false, scrapeOk: true }),
    ).toBe(false)
  })
})
