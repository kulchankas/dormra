import { describe, expect, it } from 'vitest'
import { parseOeADAvailability } from './shared'

describe('parseOeADAvailability', () => {
  it('returns false when fully booked for winter semester', () => {
    expect(
      parseOeADAvailability('fully booked for WS 2026\n\nPlease choose a category to apply!'),
    ).toBe(false)
  })

  it('returns true when apply is open', () => {
    expect(parseOeADAvailability('Please choose a category to apply!')).toBe(true)
  })

  it('returns true when apply now is shown without fully booked', () => {
    expect(parseOeADAvailability('Apply now!')).toBe(true)
  })

  it('handles German ausgebucht text', () => {
    expect(parseOeADAvailability('ausgebucht für WS 2026')).toBe(false)
  })
})
