import { describe, expect, it } from 'vitest'
import { isStaleAppliedStatus, STALE_APPLIED_DAYS } from './tracker-stale'

describe('isStaleAppliedStatus', () => {
  const now = new Date('2026-07-13T12:00:00Z').getTime()

  it('returns false when updated recently', () => {
    const recent = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(isStaleAppliedStatus(recent, now)).toBe(false)
  })

  it('returns true when updated at or beyond threshold', () => {
    const stale = new Date(now - STALE_APPLIED_DAYS * 24 * 60 * 60 * 1000).toISOString()
    expect(isStaleAppliedStatus(stale, now)).toBe(true)
  })

  it('returns false for invalid dates', () => {
    expect(isStaleAppliedStatus('not-a-date', now)).toBe(false)
  })
})
